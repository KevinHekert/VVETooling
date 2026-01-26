"""Budget API routes.

Implements FEAT-006 (Begroting) and STORY-006 (Begroting opstellen en exporteren).
"""

import uuid
from typing import Annotated
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies.auth import (
    CurrentUser,
    require_penningmeester,
    require_member,
)
from app.db.models.models import Budget, BudgetItem, VVE
from app.db.session import get_db
from app.schemas.budget import (
    BudgetCreate,
    BudgetResponse,
    BudgetUpdate,
    BudgetSummary,
)

router = APIRouter(prefix="/vves/{vve_id}/budgets", tags=["budgets"])


@router.post(
    "",
    response_model=BudgetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Begroting aanmaken",
    description="""
    STORY-006: Als beheerder wil ik een begroting kunnen opstellen, opslaan en
    exporteren vanuit het financieel menu.
    
    Vereist penningmeester of beheerder rol.
    """,
)
async def create_budget(
    vve_id: uuid.UUID,
    budget_data: BudgetCreate,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BudgetResponse:
    """Create a new budget with items.
    
    Accepts: jaar, naam, beschrijving, items met categorie en bedrag.
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
    
    # Check if budget for this year already exists
    existing_result = await db.execute(
        select(Budget).where(
            Budget.vve_id == vve_id,
            Budget.year == budget_data.year,
        )
    )
    if existing_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Begroting voor jaar {budget_data.year} bestaat al",
        )
    
    # Create budget
    budget = Budget(
        vve_id=vve_id,
        year=budget_data.year,
        name=budget_data.name,
        description=budget_data.description,
        status=budget_data.status,
        created_by_id=current_user.id,
    )
    db.add(budget)
    await db.flush()  # Flush to get budget.id
    
    # Create budget items
    for item_data in budget_data.items:
        budget_item = BudgetItem(
            budget_id=budget.id,
            category=item_data.category,
            description=item_data.description,
            planned_amount=item_data.planned_amount,
            notes=item_data.notes,
        )
        db.add(budget_item)
    
    await db.commit()
    await db.refresh(budget, ["items"])
    
    return BudgetResponse.model_validate(budget)


@router.get(
    "",
    response_model=list[BudgetResponse],
    summary="Begrotingen ophalen",
)
async def list_budgets(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[BudgetResponse]:
    """Get list of budgets for a VVE.
    
    All VVE members can view budgets (read access).
    """
    query = (
        select(Budget)
        .where(Budget.vve_id == vve_id)
        .options(selectinload(Budget.items))
        .order_by(Budget.year.desc())
    )
    
    result = await db.execute(query)
    budgets = result.scalars().all()
    
    return [BudgetResponse.model_validate(b) for b in budgets]


@router.get(
    "/{budget_id}",
    response_model=BudgetResponse,
    summary="Begroting ophalen",
)
async def get_budget(
    vve_id: uuid.UUID,
    budget_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BudgetResponse:
    """Get a specific budget by ID."""
    result = await db.execute(
        select(Budget)
        .where(Budget.id == budget_id, Budget.vve_id == vve_id)
        .options(selectinload(Budget.items))
    )
    budget = result.scalar_one_or_none()
    
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Begroting niet gevonden",
        )
    
    return BudgetResponse.model_validate(budget)


@router.get(
    "/{budget_id}/summary",
    response_model=BudgetSummary,
    summary="Begroting samenvatting",
)
async def get_budget_summary(
    vve_id: uuid.UUID,
    budget_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BudgetSummary:
    """Get summary of budget for overview.
    
    Supports FEAT-006: Begroting.
    """
    result = await db.execute(
        select(Budget)
        .where(Budget.id == budget_id, Budget.vve_id == vve_id)
        .options(selectinload(Budget.items))
    )
    budget = result.scalar_one_or_none()
    
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Begroting niet gevonden",
        )
    
    # Calculate summary
    total_planned = Decimal("0.00")
    by_category: dict[str, Decimal] = {}
    
    for item in budget.items:
        total_planned += item.planned_amount
        cat_key = item.category.value
        if cat_key not in by_category:
            by_category[cat_key] = Decimal("0.00")
        by_category[cat_key] += item.planned_amount
    
    return BudgetSummary(
        total_planned=total_planned,
        by_category=by_category,
        item_count=len(budget.items),
    )


@router.put(
    "/{budget_id}",
    response_model=BudgetResponse,
    summary="Begroting wijzigen",
)
async def update_budget(
    vve_id: uuid.UUID,
    budget_id: uuid.UUID,
    update_data: BudgetUpdate,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BudgetResponse:
    """Update an existing budget.
    
    Requires penningmeester or beheerder role.
    Can update budget metadata and replace all items.
    """
    result = await db.execute(
        select(Budget)
        .where(Budget.id == budget_id, Budget.vve_id == vve_id)
        .options(selectinload(Budget.items))
    )
    budget = result.scalar_one_or_none()
    
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Begroting niet gevonden",
        )
    
    # Update basic fields
    if update_data.name is not None:
        budget.name = update_data.name
    if update_data.description is not None:
        budget.description = update_data.description
    if update_data.status is not None:
        budget.status = update_data.status
    
    # Replace items if provided
    if update_data.items is not None:
        # Delete existing items
        for item in budget.items:
            await db.delete(item)
        await db.flush()
        
        # Create new items
        for item_data in update_data.items:
            budget_item = BudgetItem(
                budget_id=budget.id,
                category=item_data.category,
                description=item_data.description,
                planned_amount=item_data.planned_amount,
                notes=item_data.notes,
            )
            db.add(budget_item)
    
    await db.commit()
    await db.refresh(budget, ["items"])
    
    return BudgetResponse.model_validate(budget)


@router.delete(
    "/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Begroting verwijderen",
)
async def delete_budget(
    vve_id: uuid.UUID,
    budget_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_penningmeester)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a budget.
    
    Requires penningmeester or beheerder role.
    """
    result = await db.execute(
        select(Budget).where(Budget.id == budget_id, Budget.vve_id == vve_id)
    )
    budget = result.scalar_one_or_none()
    
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Begroting niet gevonden",
        )
    
    await db.delete(budget)
    await db.commit()


@router.get(
    "/{budget_id}/export/pdf",
    summary="Begroting exporteren als PDF",
    description="""
    STORY-006: Export naar PDF is beschikbaar vanuit de pagina (inline actie, geen modals).
    
    Exporteert de begroting naar PDF formaat voor rapportage en archivering.
    """,
)
async def export_budget_pdf(
    vve_id: uuid.UUID,
    budget_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Export budget to PDF format.
    
    Note: This is a placeholder implementation. In production, this would use
    a PDF generation library like ReportLab or WeasyPrint.
    """
    result = await db.execute(
        select(Budget)
        .where(Budget.id == budget_id, Budget.vve_id == vve_id)
        .options(selectinload(Budget.items))
    )
    budget = result.scalar_one_or_none()
    
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Begroting niet gevonden",
        )
    
    # Placeholder: Generate simple text-based "PDF" content
    # In production, use proper PDF generation library
    content = f"""
BEGROTING {budget.year}
VVE: {vve_id}

Naam: {budget.name}
Beschrijving: {budget.description or 'N/A'}
Status: {budget.status}

ITEMS:
"""
    total = Decimal("0.00")
    for item in budget.items:
        content += f"\n{item.category.value}: {item.description} - €{item.planned_amount}"
        total += item.planned_amount
    
    content += f"\n\nTOTAAL: €{total}"
    
    return Response(
        content=content.encode("utf-8"),
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=begroting_{budget.year}.txt"
        },
    )
