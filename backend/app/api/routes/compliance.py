"""Compliance API routes.

Implements EPIC-016 (Juridisch & Compliance):
- FEAT-035: Compliance Dashboard (STORY-078, STORY-079, STORY-121)
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Annotated

from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import (
    ComplianceItem,
    ComplianceHistory,
    ComplianceCategory as DBComplianceCategory,
    ComplianceStatus as DBComplianceStatus,
    Document,
    User,
    VVE,
)
from app.db.session import get_db
from app.schemas.compliance import (
    ComplianceAlert,
    ComplianceAlertsResponse,
    ComplianceCategory,
    ComplianceCategorySummary,
    ComplianceCompletionRequest,
    ComplianceCompletionResponse,
    ComplianceDashboard,
    ComplianceHistoryEntry,
    ComplianceHistoryResponse,
    ComplianceItemCreate,
    ComplianceItemResponse,
    ComplianceItemUpdate,
    ComplianceStatus,
)

router = APIRouter(prefix="/vves/{vve_id}/compliance", tags=["compliance"])

CATEGORY_LABELS = {
    ComplianceCategory.KVK: "KvK Registratie",
    ComplianceCategory.VERZEKERING: "Verzekeringen",
    ComplianceCategory.AVG: "Privacy/AVG",
    ComplianceCategory.ALV: "Algemene Ledenvergadering",
    ComplianceCategory.ONDERHOUD: "Onderhoud",
    ComplianceCategory.FINANCIEEL: "Financiële Rapportage",
    ComplianceCategory.OVERIG: "Overig",
}


def calculate_item_status(item: ComplianceItem) -> DBComplianceStatus:
    """Calculate the status of a compliance item based on deadline and completion."""
    if item.is_completed:
        return DBComplianceStatus.COMPLIANT
    
    if item.deadline:
        now = datetime.now(timezone.utc)
        if item.deadline < now:
            return DBComplianceStatus.NIET_COMPLIANT
        
        days_until = (item.deadline - now).days
        if days_until <= item.alert_days_before:
            return DBComplianceStatus.AANDACHT
    
    return DBComplianceStatus.AANDACHT


def calculate_days_until_deadline(deadline: datetime | None) -> int | None:
    """Calculate days until deadline."""
    if not deadline:
        return None
    now = datetime.now(timezone.utc)
    return (deadline - now).days


# ============================================================================
# Compliance Dashboard (STORY-078)
# ============================================================================


@router.get(
    "/dashboard",
    response_model=ComplianceDashboard,
    summary="Compliance dashboard",
    description="""
    STORY-078: Bekijk de compliance status per categorie.
    
    - Dashboard toont status per compliance-categorie
    - Status: compliant, aandacht nodig, niet-compliant
    - Percentage overall compliance berekend
    """,
)
async def get_compliance_dashboard(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceDashboard:
    """Get compliance dashboard (STORY-078)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    # Get all compliance items
    items_result = await db.execute(
        select(ComplianceItem).where(ComplianceItem.vve_id == vve_id)
    )
    items = items_result.scalars().all()

    # Calculate category summaries
    categories_data: dict[str, dict] = {
        cat.value: {
            "total": 0,
            "completed": 0,
            "pending": 0,
            "overdue": 0,
        }
        for cat in ComplianceCategory
    }

    now = datetime.now(timezone.utc)
    upcoming_deadlines = []
    
    for item in items:
        cat = item.category.value
        categories_data[cat]["total"] += 1
        
        if item.is_completed:
            categories_data[cat]["completed"] += 1
        else:
            categories_data[cat]["pending"] += 1
            if item.deadline and item.deadline < now:
                categories_data[cat]["overdue"] += 1
            
            # Add to upcoming deadlines if within 90 days
            if item.deadline:
                days_until = (item.deadline - now).days
                if 0 <= days_until <= 90:
                    upcoming_deadlines.append(item)

    # Build category summaries
    category_summaries = []
    for cat in ComplianceCategory:
        data = categories_data[cat.value]
        if data["total"] == 0:
            continue
        
        pct = (data["completed"] / data["total"] * 100) if data["total"] > 0 else 0
        
        if data["overdue"] > 0:
            cat_status = ComplianceStatus.NIET_COMPLIANT
        elif pct == 100:
            cat_status = ComplianceStatus.COMPLIANT
        else:
            cat_status = ComplianceStatus.AANDACHT

        category_summaries.append(ComplianceCategorySummary(
            category=cat,
            category_label=CATEGORY_LABELS.get(cat, cat.value),
            total_items=data["total"],
            completed_items=data["completed"],
            pending_items=data["pending"],
            overdue_items=data["overdue"],
            status=cat_status,
            compliance_percentage=round(pct, 1),
        ))

    # Calculate overall stats
    total_items = len(items)
    completed_items = sum(1 for i in items if i.is_completed)
    overdue_items = sum(1 for i in items if not i.is_completed and i.deadline and i.deadline < now)
    pending_items = total_items - completed_items

    overall_pct = (completed_items / total_items * 100) if total_items > 0 else 100
    if overdue_items > 0:
        overall_status = ComplianceStatus.NIET_COMPLIANT
    elif overall_pct == 100:
        overall_status = ComplianceStatus.COMPLIANT
    else:
        overall_status = ComplianceStatus.AANDACHT

    # Build upcoming deadlines response
    upcoming_response = []
    for item in sorted(upcoming_deadlines, key=lambda x: x.deadline or datetime.max.replace(tzinfo=timezone.utc))[:5]:
        days_until = calculate_days_until_deadline(item.deadline)
        upcoming_response.append(ComplianceItemResponse(
            id=item.id,
            vve_id=item.vve_id,
            title=item.title,
            description=item.description,
            category=ComplianceCategory(item.category.value),
            deadline=item.deadline,
            alert_days_before=item.alert_days_before,
            is_recurring=item.is_recurring,
            recurrence_months=item.recurrence_months,
            status=ComplianceStatus(calculate_item_status(item).value),
            is_completed=item.is_completed,
            completed_at=item.completed_at,
            created_at=item.created_at,
            updated_at=item.updated_at,
            days_until_deadline=days_until,
            is_deadline_approaching=days_until is not None and days_until <= item.alert_days_before,
            is_overdue=days_until is not None and days_until < 0,
        ))

    return ComplianceDashboard(
        vve_id=vve_id,
        overall_compliance_percentage=round(overall_pct, 1),
        overall_status=overall_status,
        total_items=total_items,
        completed_items=completed_items,
        pending_items=pending_items,
        overdue_items=overdue_items,
        categories=category_summaries,
        upcoming_deadlines=upcoming_response,
    )


# ============================================================================
# Compliance Items CRUD (STORY-078, STORY-079)
# ============================================================================


@router.post(
    "/items",
    response_model=ComplianceItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Compliance item toevoegen",
)
async def create_compliance_item(
    vve_id: uuid.UUID,
    item_data: ComplianceItemCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceItemResponse:
    """Create a new compliance item."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    item = ComplianceItem(
        vve_id=vve_id,
        title=item_data.title,
        description=item_data.description,
        category=DBComplianceCategory(item_data.category.value),
        deadline=item_data.deadline,
        alert_days_before=item_data.alert_days_before,
        is_recurring=item_data.is_recurring,
        recurrence_months=item_data.recurrence_months,
        created_by_id=current_user.id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    days_until = calculate_days_until_deadline(item.deadline)
    return ComplianceItemResponse(
        id=item.id,
        vve_id=item.vve_id,
        title=item.title,
        description=item.description,
        category=ComplianceCategory(item.category.value),
        deadline=item.deadline,
        alert_days_before=item.alert_days_before,
        is_recurring=item.is_recurring,
        recurrence_months=item.recurrence_months,
        status=ComplianceStatus(calculate_item_status(item).value),
        is_completed=item.is_completed,
        completed_at=item.completed_at,
        created_by_id=item.created_by_id,
        created_at=item.created_at,
        updated_at=item.updated_at,
        days_until_deadline=days_until,
        is_deadline_approaching=days_until is not None and days_until <= item.alert_days_before,
        is_overdue=days_until is not None and days_until < 0,
    )


@router.get(
    "/items",
    response_model=list[ComplianceItemResponse],
    summary="Lijst compliance items",
)
async def list_compliance_items(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    category: ComplianceCategory | None = None,
    status_filter: ComplianceStatus | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[ComplianceItemResponse]:
    """Get list of compliance items."""
    query = select(ComplianceItem).where(ComplianceItem.vve_id == vve_id)

    if category:
        query = query.where(ComplianceItem.category == DBComplianceCategory(category.value))

    query = query.order_by(ComplianceItem.deadline.asc().nulls_last())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    items = result.scalars().all()

    response = []
    for item in items:
        item_status = calculate_item_status(item)
        
        # Filter by status if requested
        if status_filter and ComplianceStatus(item_status.value) != status_filter:
            continue

        days_until = calculate_days_until_deadline(item.deadline)
        
        # Get completed_by name if applicable
        completed_by_name = None
        if item.completed_by_id:
            user_result = await db.execute(select(User).where(User.id == item.completed_by_id))
            user = user_result.scalar_one_or_none()
            if user:
                completed_by_name = f"{user.first_name} {user.last_name}"

        # Get evidence document name if applicable
        evidence_document_name = None
        if item.evidence_document_id:
            doc_result = await db.execute(select(Document).where(Document.id == item.evidence_document_id))
            doc = doc_result.scalar_one_or_none()
            if doc:
                evidence_document_name = doc.title

        response.append(ComplianceItemResponse(
            id=item.id,
            vve_id=item.vve_id,
            title=item.title,
            description=item.description,
            category=ComplianceCategory(item.category.value),
            deadline=item.deadline,
            alert_days_before=item.alert_days_before,
            is_recurring=item.is_recurring,
            recurrence_months=item.recurrence_months,
            status=ComplianceStatus(item_status.value),
            is_completed=item.is_completed,
            completed_at=item.completed_at,
            completed_by_id=item.completed_by_id,
            completed_by_name=completed_by_name,
            evidence_document_id=item.evidence_document_id,
            evidence_document_name=evidence_document_name,
            created_by_id=item.created_by_id,
            created_at=item.created_at,
            updated_at=item.updated_at,
            days_until_deadline=days_until,
            is_deadline_approaching=days_until is not None and days_until <= item.alert_days_before,
            is_overdue=days_until is not None and days_until < 0,
        ))

    return response


@router.get(
    "/items/{item_id}",
    response_model=ComplianceItemResponse,
    summary="Compliance item details",
)
async def get_compliance_item(
    vve_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceItemResponse:
    """Get a specific compliance item."""
    result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.id == item_id,
            ComplianceItem.vve_id == vve_id,
        )
    )
    item = result.scalar_one_or_none()

    if item is None:
        raise HTTPException(status_code=404, detail="Compliance item niet gevonden")

    days_until = calculate_days_until_deadline(item.deadline)
    return ComplianceItemResponse(
        id=item.id,
        vve_id=item.vve_id,
        title=item.title,
        description=item.description,
        category=ComplianceCategory(item.category.value),
        deadline=item.deadline,
        alert_days_before=item.alert_days_before,
        is_recurring=item.is_recurring,
        recurrence_months=item.recurrence_months,
        status=ComplianceStatus(calculate_item_status(item).value),
        is_completed=item.is_completed,
        completed_at=item.completed_at,
        created_by_id=item.created_by_id,
        created_at=item.created_at,
        updated_at=item.updated_at,
        days_until_deadline=days_until,
        is_deadline_approaching=days_until is not None and days_until <= item.alert_days_before,
        is_overdue=days_until is not None and days_until < 0,
    )


@router.put(
    "/items/{item_id}",
    response_model=ComplianceItemResponse,
    summary="Compliance item wijzigen",
)
async def update_compliance_item(
    vve_id: uuid.UUID,
    item_id: uuid.UUID,
    update_data: ComplianceItemUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceItemResponse:
    """Update a compliance item."""
    result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.id == item_id,
            ComplianceItem.vve_id == vve_id,
        )
    )
    item = result.scalar_one_or_none()

    if item is None:
        raise HTTPException(status_code=404, detail="Compliance item niet gevonden")

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "category" and value is not None:
            setattr(item, field, DBComplianceCategory(value.value))
        else:
            setattr(item, field, value)

    await db.commit()
    await db.refresh(item)

    days_until = calculate_days_until_deadline(item.deadline)
    return ComplianceItemResponse(
        id=item.id,
        vve_id=item.vve_id,
        title=item.title,
        description=item.description,
        category=ComplianceCategory(item.category.value),
        deadline=item.deadline,
        alert_days_before=item.alert_days_before,
        is_recurring=item.is_recurring,
        recurrence_months=item.recurrence_months,
        status=ComplianceStatus(calculate_item_status(item).value),
        is_completed=item.is_completed,
        completed_at=item.completed_at,
        created_by_id=item.created_by_id,
        created_at=item.created_at,
        updated_at=item.updated_at,
        days_until_deadline=days_until,
        is_deadline_approaching=days_until is not None and days_until <= item.alert_days_before,
        is_overdue=days_until is not None and days_until < 0,
    )


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Compliance item verwijderen",
)
async def delete_compliance_item(
    vve_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a compliance item."""
    result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.id == item_id,
            ComplianceItem.vve_id == vve_id,
        )
    )
    item = result.scalar_one_or_none()

    if item is None:
        raise HTTPException(status_code=404, detail="Compliance item niet gevonden")

    await db.delete(item)
    await db.commit()


# ============================================================================
# Compliance Completion (STORY-079)
# ============================================================================


@router.post(
    "/items/{item_id}/complete",
    response_model=ComplianceCompletionResponse,
    summary="Compliance item afvinken",
    description="""
    STORY-079: Vink een compliance item af met bewijs.
    
    - Afvinken met datum van voltooiing
    - Optioneel document als bewijs uploaden
    - Historie van voltooiingen bijhouden
    """,
)
async def complete_compliance_item(
    vve_id: uuid.UUID,
    item_id: uuid.UUID,
    completion_data: ComplianceCompletionRequest,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceCompletionResponse:
    """Mark a compliance item as complete (STORY-079)."""
    # Get item
    result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.id == item_id,
            ComplianceItem.vve_id == vve_id,
        )
    )
    item = result.scalar_one_or_none()

    if item is None:
        raise HTTPException(status_code=404, detail="Compliance item niet gevonden")

    completion_time = completion_data.completion_date or datetime.now(timezone.utc)

    # Update item
    item.is_completed = True
    item.completed_at = completion_time
    item.completed_by_id = current_user.id
    item.status = DBComplianceStatus.COMPLIANT
    if completion_data.evidence_document_id:
        item.evidence_document_id = completion_data.evidence_document_id

    # Create history entry
    history = ComplianceHistory(
        compliance_item_id=item_id,
        completed_at=completion_time,
        completed_by_id=current_user.id,
        evidence_document_id=completion_data.evidence_document_id,
        notes=completion_data.notes,
    )
    db.add(history)

    # If recurring, create next deadline
    if item.is_recurring and item.recurrence_months and item.deadline:
        item.deadline = item.deadline + relativedelta(months=item.recurrence_months)
        item.is_completed = False
        item.completed_at = None
        item.completed_by_id = None
        item.evidence_document_id = None

    await db.commit()

    # Get evidence document name
    evidence_document_name = None
    if completion_data.evidence_document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == completion_data.evidence_document_id)
        )
        doc = doc_result.scalar_one_or_none()
        if doc:
            evidence_document_name = doc.title

    return ComplianceCompletionResponse(
        compliance_item_id=item_id,
        completed_at=completion_time,
        completed_by_name=f"{current_user.first_name} {current_user.last_name}",
        evidence_document_name=evidence_document_name,
        message="Compliance item succesvol afgevinkt",
    )


# ============================================================================
# Compliance Alerts (STORY-121)
# ============================================================================


@router.get(
    "/alerts",
    response_model=ComplianceAlertsResponse,
    summary="Compliance alerts ophalen",
    description="""
    STORY-121: Ontvang alerts voor naderende compliance deadlines.
    
    - Alert voor: jaarlijkse ALV, KvK update, verzekering verlenging
    - Configureerbare termijnen (30, 60, 90 dagen)
    """,
)
async def get_compliance_alerts(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceAlertsResponse:
    """Get compliance alerts (STORY-121)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    # Get incomplete items with deadlines
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.vve_id == vve_id,
            ComplianceItem.is_completed == False,
            ComplianceItem.deadline.isnot(None),
        ).order_by(ComplianceItem.deadline.asc())
    )
    items = result.scalars().all()

    alerts = []
    critical_count = 0
    warning_count = 0
    info_count = 0

    for item in items:
        if item.deadline is None:
            continue
            
        days_until = (item.deadline - now).days

        # Determine alert level
        if days_until < 0:
            alert_level = "critical"
            critical_count += 1
        elif days_until <= 7:
            alert_level = "critical"
            critical_count += 1
        elif days_until <= 30:
            alert_level = "warning"
            warning_count += 1
        elif days_until <= item.alert_days_before:
            alert_level = "info"
            info_count += 1
        else:
            continue  # No alert needed

        alerts.append(ComplianceAlert(
            compliance_item_id=item.id,
            title=item.title,
            category=ComplianceCategory(item.category.value),
            deadline=item.deadline,
            days_until_deadline=days_until,
            alert_level=alert_level,
            action_url=f"/dashboard/beheerder/compliance/items/{item.id}",
        ))

    return ComplianceAlertsResponse(
        vve_id=vve_id,
        total_alerts=len(alerts),
        critical_count=critical_count,
        warning_count=warning_count,
        info_count=info_count,
        alerts=alerts,
    )


# ============================================================================
# Compliance History (STORY-079)
# ============================================================================


@router.get(
    "/items/{item_id}/history",
    response_model=ComplianceHistoryResponse,
    summary="Compliance historie ophalen",
)
async def get_compliance_history(
    vve_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ComplianceHistoryResponse:
    """Get history of compliance item completions (STORY-079)."""
    # Get item
    item_result = await db.execute(
        select(ComplianceItem).where(
            ComplianceItem.id == item_id,
            ComplianceItem.vve_id == vve_id,
        )
    )
    item = item_result.scalar_one_or_none()

    if item is None:
        raise HTTPException(status_code=404, detail="Compliance item niet gevonden")

    # Get history
    history_result = await db.execute(
        select(ComplianceHistory)
        .where(ComplianceHistory.compliance_item_id == item_id)
        .order_by(ComplianceHistory.completed_at.desc())
    )
    history_entries = history_result.scalars().all()

    entries = []
    for entry in history_entries:
        # Get completed_by name
        completed_by_name = None
        if entry.completed_by_id:
            user_result = await db.execute(select(User).where(User.id == entry.completed_by_id))
            user = user_result.scalar_one_or_none()
            if user:
                completed_by_name = f"{user.first_name} {user.last_name}"

        # Get evidence document name
        evidence_document_name = None
        if entry.evidence_document_id:
            doc_result = await db.execute(select(Document).where(Document.id == entry.evidence_document_id))
            doc = doc_result.scalar_one_or_none()
            if doc:
                evidence_document_name = doc.title

        entries.append(ComplianceHistoryEntry(
            id=entry.id,
            compliance_item_id=entry.compliance_item_id,
            completed_at=entry.completed_at,
            completed_by_id=entry.completed_by_id,
            completed_by_name=completed_by_name,
            evidence_document_id=entry.evidence_document_id,
            evidence_document_name=evidence_document_name,
            notes=entry.notes,
            created_at=entry.created_at,
        ))

    return ComplianceHistoryResponse(
        compliance_item_id=item_id,
        item_title=item.title,
        entries=entries,
        total_completions=len(entries),
    )
