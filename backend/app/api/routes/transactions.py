"""Transaction API routes.

Implements FEAT-001 (Transactiebeheer) and STORY-001 (Transactie toevoegen).
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_penningmeester,
    require_member,
    UserRole,
)
from app.db.models.models import Transaction, VVE, ReserveFund
from app.db.session import get_db
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
    TransactionSummary,
)

router = APIRouter(prefix="/vves/{vve_id}/transactions", tags=["transactions"])


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Transactie toevoegen",
    description="""
    STORY-001: Als penningmeester wil ik een transactie toevoegen met
    bedrag, datum en categorie, zodat mijn financieel overzicht actueel blijft.

    Vereist penningmeester of beheerder rol.
    """,
)
async def create_transaction(
    vve_id: uuid.UUID,
    transaction_data: TransactionCreate,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TransactionResponse:
    """Create a new financial transaction.

    Accepts: datum, bedrag, categorie, reserve en beschrijving.
    Returns: toast success message (handled by frontend).
    Validation: inline feedback (no blocking dialogs).
    """
    # Verify VVE exists and user has access
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    vve = vve_result.scalar_one_or_none()
    if vve is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Validate reserve fund if provided
    if transaction_data.reserve_fund_id:
        reserve_result = await db.execute(
            select(ReserveFund).where(
                ReserveFund.id == transaction_data.reserve_fund_id,
                ReserveFund.vve_id == vve_id,
            )
        )
        if reserve_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reserve fonds niet gevonden voor deze VVE",
            )

    # Create transaction
    transaction = Transaction(
        vve_id=vve_id,
        amount=transaction_data.amount,
        category=transaction_data.category,
        description=transaction_data.description,
        transaction_date=transaction_data.transaction_date,
        reserve_fund_id=transaction_data.reserve_fund_id,
        created_by_id=current_user.id,
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    return TransactionResponse.model_validate(transaction)


@router.get(
    "",
    response_model=list[TransactionResponse],
    summary="Transacties ophalen",
)
async def list_transactions(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: str | None = None,
) -> list[TransactionResponse]:
    """Get list of transactions for a VVE.

    All VVE members can view transactions (read access).
    Pagination and filtering supported.
    """
    query = select(Transaction).where(Transaction.vve_id == vve_id)

    if category:
        query = query.where(Transaction.category == category)

    query = query.order_by(Transaction.transaction_date.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    transactions = result.scalars().all()

    return [TransactionResponse.model_validate(t) for t in transactions]


@router.get(
    "/summary",
    response_model=TransactionSummary,
    summary="Transactie samenvatting",
)
async def get_transaction_summary(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    year: int | None = None,
) -> TransactionSummary:
    """Get summary of transactions for financial overview.

    Supports EPIC-001: Financieel overzicht beheren.
    """
    query = select(Transaction).where(Transaction.vve_id == vve_id)

    if year:
        query = query.where(
            func.extract("year", Transaction.transaction_date) == year
        )

    result = await db.execute(query)
    transactions = result.scalars().all()

    # Calculate summary
    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    by_category: dict[str, float] = {}

    for t in transactions:
        cat_key = t.category.value
        if cat_key not in by_category:
            by_category[cat_key] = 0
        by_category[cat_key] += float(t.amount)

    return TransactionSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        transaction_count=len(transactions),
        by_category=by_category,
    )


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Transactie details ophalen",
)
async def get_transaction(
    vve_id: uuid.UUID,
    transaction_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TransactionResponse:
    """Get a specific transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.vve_id == vve_id,
        )
    )
    transaction = result.scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transactie niet gevonden",
        )

    return TransactionResponse.model_validate(transaction)


@router.put(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Transactie wijzigen",
)
async def update_transaction(
    vve_id: uuid.UUID,
    transaction_id: uuid.UUID,
    update_data: TransactionUpdate,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TransactionResponse:
    """Update an existing transaction.

    Requires penningmeester or beheerder role.
    """
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.vve_id == vve_id,
        )
    )
    transaction = result.scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transactie niet gevonden",
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(transaction, field, value)

    await db.commit()
    await db.refresh(transaction)

    return TransactionResponse.model_validate(transaction)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Transactie verwijderen",
)
async def delete_transaction(
    vve_id: uuid.UUID,
    transaction_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a transaction.

    Requires penningmeester or beheerder role.
    """
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.vve_id == vve_id,
        )
    )
    transaction = result.scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transactie niet gevonden",
        )

    await db.delete(transaction)
    await db.commit()
