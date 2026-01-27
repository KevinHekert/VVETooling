"""Audit Log API routes.

Implements FEAT-015 (Audit Logging) and STORY-010 (Audit logging zichtbaar in UI).
Implements STORY-023: Audit logging filters en export.
"""

import csv
import io
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_beheerder,
)
from app.db.models.models import AuditLog, User
from app.db.session import get_db
from app.schemas.audit import (
    AuditLogResponse,
    AuditLogListResponse,
    AuditLogFilters,
    AuditLogExportResponse,
)

router = APIRouter(prefix="/vves/{vve_id}/audit-logs", tags=["audit"])


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="Audit logs ophalen",
    description="""
    STORY-010: Als beheerder wil ik audit logs kunnen bekijken en filteren.
    
    - Logs tonen: gebruiker, rol, actie, timestamp, resultaat
    - Filters op periode, rol en actie
    - Voorbereid op extra kolommen (IP, tenant)
    """,
)
async def list_audit_logs(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
    # Filters
    action: str | None = Query(None, description="Filter by action type"),
    entity_type: str | None = Query(None, description="Filter by entity type"),
    user_id: uuid.UUID | None = Query(None, description="Filter by user ID"),
    start_date: datetime | None = Query(None, description="Filter from date (inclusive)"),
    end_date: datetime | None = Query(None, description="Filter to date (inclusive)"),
    is_financial: bool | None = Query(None, description="Filter financial actions only"),
    # Pagination
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> AuditLogListResponse:
    """Get audit logs for a VVE with optional filters.
    
    Requires beheerder role.
    """
    # Build query with filters
    query = select(AuditLog).where(AuditLog.vve_id == vve_id)
    
    conditions = []
    
    if action:
        conditions.append(AuditLog.action == action)
    
    if entity_type:
        conditions.append(AuditLog.entity_type == entity_type)
    
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    
    if start_date:
        conditions.append(AuditLog.created_at >= start_date)
    
    if end_date:
        conditions.append(AuditLog.created_at <= end_date)
    
    if is_financial is not None:
        conditions.append(AuditLog.is_financial == is_financial)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Get total count
    count_query = select(func.count(AuditLog.id)).where(AuditLog.vve_id == vve_id)
    if conditions:
        count_query = count_query.where(and_(*conditions))
    
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0
    
    # Get paginated results
    query = query.order_by(AuditLog.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Get user names for the logs
    user_ids = [log.user_id for log in logs if log.user_id]
    user_names = {}
    
    if user_ids:
        users_result = await db.execute(
            select(User.id, User.first_name, User.last_name)
            .where(User.id.in_(user_ids))
        )
        for user_id, first_name, last_name in users_result:
            user_names[user_id] = f"{first_name} {last_name}"
    
    # Build response
    items = []
    for log in logs:
        response = AuditLogResponse.model_validate(log)
        if log.user_id and log.user_id in user_names:
            response.user_name = user_names[log.user_id]
        items.append(response)
    
    return AuditLogListResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.get(
    "/actions",
    response_model=list[str],
    summary="Beschikbare actie types ophalen",
)
async def list_action_types(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[str]:
    """Get distinct action types for filter dropdown."""
    result = await db.execute(
        select(AuditLog.action)
        .where(AuditLog.vve_id == vve_id)
        .distinct()
        .order_by(AuditLog.action)
    )
    return list(result.scalars().all())


@router.get(
    "/entity-types",
    response_model=list[str],
    summary="Beschikbare entity types ophalen",
)
async def list_entity_types(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[str]:
    """Get distinct entity types for filter dropdown."""
    result = await db.execute(
        select(AuditLog.entity_type)
        .where(AuditLog.vve_id == vve_id)
        .distinct()
        .order_by(AuditLog.entity_type)
    )
    return list(result.scalars().all())


# ============================================================================
# Export Endpoints (STORY-023)
# ============================================================================

# Action and entity type labels for export
ACTION_LABELS = {
    "create": "Aangemaakt",
    "update": "Gewijzigd",
    "delete": "Verwijderd",
    "upload": "Geüpload",
    "download": "Gedownload",
    "login": "Ingelogd",
    "approve": "Goedgekeurd",
    "share": "Gedeeld",
}

ENTITY_LABELS = {
    "transaction": "Transactie",
    "document": "Document",
    "budget": "Begroting",
    "user": "Gebruiker",
    "unit": "Eenheid",
    "ticket": "Ticket",
    "supplier": "Leverancier",
}


@router.get(
    "/export/csv",
    summary="Audit logs exporteren naar CSV",
    description="""
    STORY-023: Exporteer audit logs naar CSV formaat.
    
    - Filters worden toegepast op de export
    - Kolommen: Datum, Gebruiker, Actie, Type, Entiteit ID, IP-adres, Financieel
    - Beheerder rol vereist
    """,
    response_class=StreamingResponse,
)
async def export_audit_logs_csv(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
    # Filters
    action: str | None = Query(None, description="Filter by action type"),
    entity_type: str | None = Query(None, description="Filter by entity type"),
    user_id: uuid.UUID | None = Query(None, description="Filter by user ID"),
    start_date: datetime | None = Query(None, description="Filter from date (inclusive)"),
    end_date: datetime | None = Query(None, description="Filter to date (inclusive)"),
    is_financial: bool | None = Query(None, description="Filter financial actions only"),
) -> StreamingResponse:
    """Export audit logs to CSV format.
    
    Requires beheerder role.
    Returns a streaming CSV file.
    """
    # Build query with filters (same as list_audit_logs)
    query = select(AuditLog).where(AuditLog.vve_id == vve_id)
    
    conditions = []
    
    if action:
        conditions.append(AuditLog.action == action)
    
    if entity_type:
        conditions.append(AuditLog.entity_type == entity_type)
    
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    
    if start_date:
        conditions.append(AuditLog.created_at >= start_date)
    
    if end_date:
        conditions.append(AuditLog.created_at <= end_date)
    
    if is_financial is not None:
        conditions.append(AuditLog.is_financial == is_financial)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Get all matching logs (no pagination for export)
    query = query.order_by(AuditLog.created_at.desc()).limit(10000)  # Safety limit
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Get user names for the logs
    user_ids = [log.user_id for log in logs if log.user_id]
    user_names: dict[uuid.UUID, str] = {}
    
    if user_ids:
        users_result = await db.execute(
            select(User.id, User.first_name, User.last_name)
            .where(User.id.in_(user_ids))
        )
        for uid, first_name, last_name in users_result:
            user_names[uid] = f"{first_name} {last_name}"
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Header row
    writer.writerow([
        'Datum',
        'Tijd',
        'Gebruiker',
        'Actie',
        'Type',
        'Entiteit ID',
        'IP-adres',
        'Financieel',
    ])
    
    # Data rows
    for log in logs:
        created_dt = log.created_at
        user_name = user_names.get(log.user_id, 'Systeem') if log.user_id else 'Systeem'
        action_label = ACTION_LABELS.get(log.action, log.action)
        entity_label = ENTITY_LABELS.get(log.entity_type, log.entity_type)
        
        writer.writerow([
            created_dt.strftime('%Y-%m-%d'),
            created_dt.strftime('%H:%M:%S'),
            user_name,
            action_label,
            entity_label,
            log.entity_id or '',
            log.ip_address or '',
            'Ja' if log.is_financial else 'Nee',
        ])
    
    output.seek(0)
    
    # Generate filename with date range
    filename = f"audit_log_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8",
        },
    )


@router.get(
    "/export/summary",
    response_model=AuditLogExportResponse,
    summary="Export voorbereiding met samenvatting",
    description="""
    STORY-023: Bereid een export voor en geef een samenvatting.
    
    - Toont hoeveel records worden geëxporteerd
    - Schatting van bestandsgrootte
    - Download URL voor de export
    """,
)
async def prepare_audit_log_export(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
    export_format: str = Query(default="csv", description="Export format: csv"),
    # Filters
    action: str | None = Query(None, description="Filter by action type"),
    entity_type: str | None = Query(None, description="Filter by entity type"),
    user_id: uuid.UUID | None = Query(None, description="Filter by user ID"),
    start_date: datetime | None = Query(None, description="Filter from date (inclusive)"),
    end_date: datetime | None = Query(None, description="Filter to date (inclusive)"),
    is_financial: bool | None = Query(None, description="Filter financial actions only"),
) -> AuditLogExportResponse:
    """Prepare audit log export and return summary.
    
    Requires beheerder role.
    """
    # Build count query with filters
    count_query = select(func.count(AuditLog.id)).where(AuditLog.vve_id == vve_id)
    
    conditions = []
    
    if action:
        conditions.append(AuditLog.action == action)
    
    if entity_type:
        conditions.append(AuditLog.entity_type == entity_type)
    
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    
    if start_date:
        conditions.append(AuditLog.created_at >= start_date)
    
    if end_date:
        conditions.append(AuditLog.created_at <= end_date)
    
    if is_financial is not None:
        conditions.append(AuditLog.is_financial == is_financial)
    
    if conditions:
        count_query = count_query.where(and_(*conditions))
    
    count_result = await db.execute(count_query)
    record_count = count_result.scalar() or 0
    
    # Estimate file size (roughly 150 bytes per CSV row)
    estimated_bytes = record_count * 150
    if estimated_bytes < 1024:
        size_estimate = f"{estimated_bytes} bytes"
    elif estimated_bytes < 1024 * 1024:
        size_estimate = f"{estimated_bytes / 1024:.1f} KB"
    else:
        size_estimate = f"{estimated_bytes / (1024 * 1024):.1f} MB"
    
    # Generate export ID and URL
    export_id = uuid.uuid4()
    
    # Build query parameters for download URL
    query_params = []
    if action:
        query_params.append(f"action={action}")
    if entity_type:
        query_params.append(f"entity_type={entity_type}")
    if user_id:
        query_params.append(f"user_id={user_id}")
    if start_date:
        query_params.append(f"start_date={start_date.isoformat()}")
    if end_date:
        query_params.append(f"end_date={end_date.isoformat()}")
    if is_financial is not None:
        query_params.append(f"is_financial={str(is_financial).lower()}")
    
    query_string = "&".join(query_params)
    download_url = f"/api/v1/vves/{vve_id}/audit-logs/export/csv"
    if query_string:
        download_url += f"?{query_string}"
    
    return AuditLogExportResponse(
        export_id=export_id,
        format=export_format,
        record_count=record_count,
        file_size_estimate=size_estimate,
        download_url=download_url,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
