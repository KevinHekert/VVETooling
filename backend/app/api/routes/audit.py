"""Audit Log API routes.

Implements FEAT-015 (Audit Logging) and STORY-010 (Audit logging zichtbaar in UI).
"""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

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
