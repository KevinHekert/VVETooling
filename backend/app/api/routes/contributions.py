"""Contribution API routes.

Implements FEAT-004 (Contributieberekening) and STORY-003 (Bewoner ziet eigen status).
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.dependencies.auth import (
    CurrentUser,
    get_current_active_user,
    require_penningmeester,
    require_member,
)
from app.db.models.models import Contribution, Unit, VVE, VVEMember
from app.db.session import get_db
from app.schemas.contribution import (
    ContributionCreate,
    ContributionResponse,
    ContributionPayment,
    ContributionStatus,
    BewonersStatusResponse,
)

router = APIRouter(tags=["contributions"])


@router.get(
    "/bewoner/status",
    response_model=BewonersStatusResponse,
    summary="Bewoner ziet eigen betalingsstatus",
    description="""
    STORY-003: Als bewoner wil ik mijn eigen betalingsstatus zien,
    zodat ik weet of mijn contributie op orde is.

    - Bewoner ziet alleen eigen status (geen andere bewoners)
    - Status is zichtbaar op mobile-first dashboard
    - Meldingen zijn niet-blokkerend (toast/inline)
    """,
)
async def get_bewoner_status(
    current_user: Annotated[CurrentUser, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    vve_id: uuid.UUID | None = Query(None, description="Optioneel: specifieke VVE"),
) -> BewonersStatusResponse:
    """Get the current user's contribution status.

    Returns status for the user's unit including:
    - Current month payment status
    - Total year-to-date figures
    - Recent payment history (mobile-optimized: last 6 months)
    - Status indicators for quick overview
    """
    # Find user's membership and unit
    membership_query = (
        select(VVEMember)
        .options(
            joinedload(VVEMember.unit),
            joinedload(VVEMember.vve),
        )
        .where(
            VVEMember.user_id == current_user.id,
            VVEMember.is_active.is_(True),
            VVEMember.unit_id.isnot(None),
        )
    )

    if vve_id:
        membership_query = membership_query.where(VVEMember.vve_id == vve_id)

    result = await db.execute(membership_query)
    membership = result.unique().scalar_one_or_none()

    if membership is None or membership.unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geen actieve eenheid gevonden voor uw account",
        )

    unit = membership.unit
    vve = membership.vve
    now = datetime.now(timezone.utc)
    current_year = now.year
    current_month = now.month

    # Get contributions for this unit in the current year
    contributions_result = await db.execute(
        select(Contribution)
        .where(
            Contribution.unit_id == unit.id,
            Contribution.year == current_year,
        )
        .order_by(Contribution.month.desc())
    )
    contributions = contributions_result.scalars().all()

    # Calculate totals
    total_due_year = sum(c.amount_due for c in contributions)
    total_paid_year = sum(c.amount_paid for c in contributions)

    # Find current month contribution
    current_month_contrib = next(
        (c for c in contributions if c.month == current_month), None
    )

    current_month_due = (
        current_month_contrib.amount_due if current_month_contrib else Decimal("0")
    )
    current_month_paid = (
        current_month_contrib.amount_paid if current_month_contrib else Decimal("0")
    )

    # Determine current month status
    if current_month_contrib is None:
        current_month_status = ContributionStatus.PENDING
    elif current_month_contrib.amount_paid >= current_month_contrib.amount_due:
        current_month_status = ContributionStatus.PAID
    elif current_month_contrib.due_date < now:
        current_month_status = ContributionStatus.OVERDUE
    else:
        current_month_status = ContributionStatus.PENDING

    # Check for any overdue payments
    has_overdue = any(
        c.due_date < now and c.amount_paid < c.amount_due for c in contributions
    )

    # Get next due date
    next_due = next(
        (c.due_date for c in sorted(contributions, key=lambda x: x.due_date)
         if c.due_date > now and c.amount_paid < c.amount_due),
        None,
    )

    # Recent contributions (last 6 for mobile)
    recent = [
        ContributionResponse.model_validate(c) for c in contributions[:6]
    ]

    return BewonersStatusResponse(
        unit_id=unit.id,
        unit_number=unit.unit_number,
        vve_name=vve.name,
        current_month_due=current_month_due,
        current_month_paid=current_month_paid,
        current_month_status=current_month_status,
        total_due_year=total_due_year,
        total_paid_year=total_paid_year,
        outstanding_balance=total_due_year - total_paid_year,
        recent_contributions=recent,
        is_up_to_date=total_paid_year >= total_due_year,
        has_overdue_payments=has_overdue,
        next_due_date=next_due,
    )


# VVE-scoped contribution endpoints (for penningmeester/beheerder)


@router.post(
    "/vves/{vve_id}/contributions",
    response_model=ContributionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Contributie aanmaken",
)
async def create_contribution(
    vve_id: uuid.UUID,
    contribution_data: ContributionCreate,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ContributionResponse:
    """Create a new contribution record for a unit.

    Requires penningmeester or beheerder role.
    """
    # Verify unit exists and belongs to VVE
    unit_result = await db.execute(
        select(Unit).where(
            Unit.id == contribution_data.unit_id,
            Unit.vve_id == vve_id,
        )
    )
    if unit_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Eenheid niet gevonden in deze VVE",
        )

    # Check for existing contribution in this period
    existing = await db.execute(
        select(Contribution).where(
            Contribution.unit_id == contribution_data.unit_id,
            Contribution.year == contribution_data.year,
            Contribution.month == contribution_data.month,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Contributie voor {contribution_data.month}/{contribution_data.year} bestaat al",
        )

    contribution = Contribution(
        unit_id=contribution_data.unit_id,
        vve_id=vve_id,
        year=contribution_data.year,
        month=contribution_data.month,
        amount_due=contribution_data.amount_due,
        due_date=contribution_data.due_date,
        status="pending",
    )
    db.add(contribution)
    await db.commit()
    await db.refresh(contribution)

    return ContributionResponse.model_validate(contribution)


@router.get(
    "/vves/{vve_id}/contributions",
    response_model=list[ContributionResponse],
    summary="Contributies ophalen",
)
async def list_contributions(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
    year: int | None = None,
    month: int | None = None,
    unit_id: uuid.UUID | None = None,
    status_filter: ContributionStatus | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[ContributionResponse]:
    """Get contributions for a VVE with optional filters.

    Requires penningmeester or beheerder role.
    """
    query = select(Contribution).where(Contribution.vve_id == vve_id)

    if year:
        query = query.where(Contribution.year == year)
    if month:
        query = query.where(Contribution.month == month)
    if unit_id:
        query = query.where(Contribution.unit_id == unit_id)
    if status_filter:
        query = query.where(Contribution.status == status_filter.value)

    query = query.order_by(
        Contribution.year.desc(),
        Contribution.month.desc(),
        Contribution.unit_id,
    )
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    contributions = result.scalars().all()

    return [ContributionResponse.model_validate(c) for c in contributions]


@router.post(
    "/vves/{vve_id}/contributions/{contribution_id}/payment",
    response_model=ContributionResponse,
    summary="Betaling registreren",
)
async def record_payment(
    vve_id: uuid.UUID,
    contribution_id: uuid.UUID,
    payment: ContributionPayment,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ContributionResponse:
    """Record a payment for a contribution.

    Requires penningmeester or beheerder role.
    """
    result = await db.execute(
        select(Contribution).where(
            Contribution.id == contribution_id,
            Contribution.vve_id == vve_id,
        )
    )
    contribution = result.scalar_one_or_none()

    if contribution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contributie niet gevonden",
        )

    # Update payment
    contribution.amount_paid = contribution.amount_paid + payment.amount
    contribution.paid_at = payment.payment_date

    # Update status
    if contribution.amount_paid >= contribution.amount_due:
        contribution.status = "paid"

    await db.commit()
    await db.refresh(contribution)

    return ContributionResponse.model_validate(contribution)
