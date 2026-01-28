"""Privacy/AVG API routes.

Implements EPIC-016 (Juridisch & Compliance):
- FEAT-036: AVG Module (STORY-080, STORY-122)
"""

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import (
    PrivacyStatement,
    PrivacyStatementStatus as DBPrivacyStatementStatus,
    DataExportRequest,
    DataExportStatus as DBDataExportStatus,
    DataExportFormat as DBDataExportFormat,
    User,
    VVE,
    VVEMember,
)
from app.db.session import get_db
from app.schemas.privacy import (
    PrivacyStatementCreate,
    PrivacyStatementUpdate,
    PrivacyStatementResponse,
    PrivacyStatementListResponse,
    PrivacyStatementStatus,
    PrivacyStatementTemplate,
    DataExportRequestCreate,
    DataExportRequestResponse,
    DataExportRequestListResponse,
    DataExportConfirmation,
    DataExportStatus,
    DataExportFormat,
)

router = APIRouter(prefix="/vves/{vve_id}/privacy", tags=["privacy"])


# ============================================================================
# Privacy Statement CRUD (STORY-080)
# ============================================================================


@router.post(
    "/statements",
    response_model=PrivacyStatementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Privacy statement aanmaken",
    description="""
    STORY-080: Als secretaris wil ik een privacy statement kunnen genereren.
    
    - Template met invulbare velden
    - Automatische invulling van VVE-naam en contactgegevens
    - Versie-historie bijhouden
    """,
)
async def create_privacy_statement(
    vve_id: uuid.UUID,
    statement_data: PrivacyStatementCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse:
    """Create a new privacy statement (STORY-080)."""
    # Get VVE for auto-filling
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    vve = vve_result.scalar_one_or_none()
    
    if vve is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    # Get default template for empty sections
    template = PrivacyStatementTemplate()

    # Create statement with VVE data or provided overrides
    statement = PrivacyStatement(
        vve_id=vve_id,
        title=statement_data.title,
        version=statement_data.version,
        vve_name=statement_data.vve_name or vve.name,
        vve_address=statement_data.vve_address or (
            f"{vve.address}, {vve.postal_code} {vve.city}" if vve.address else None
        ),
        contact_email=statement_data.contact_email,
        contact_phone=statement_data.contact_phone,
        dpo_name=statement_data.dpo_name,
        dpo_email=statement_data.dpo_email,
        # Content sections (use provided or template defaults)
        introduction=statement_data.introduction or template.introduction,
        data_collected=statement_data.data_collected or template.data_collected,
        data_purpose=statement_data.data_purpose or template.data_purpose,
        legal_basis=statement_data.legal_basis or template.legal_basis,
        data_sharing=statement_data.data_sharing or template.data_sharing,
        retention_period=statement_data.retention_period or template.retention_period,
        rights=statement_data.rights or template.rights,
        cookies=statement_data.cookies or template.cookies,
        security=statement_data.security or template.security,
        complaints=statement_data.complaints or template.complaints,
        changes=statement_data.changes or template.changes,
        created_by_id=current_user.id,
    )
    db.add(statement)
    await db.commit()
    await db.refresh(statement)

    return PrivacyStatementResponse(
        id=statement.id,
        vve_id=statement.vve_id,
        title=statement.title,
        version=statement.version,
        vve_name=statement.vve_name,
        vve_address=statement.vve_address,
        contact_email=statement.contact_email,
        contact_phone=statement.contact_phone,
        dpo_name=statement.dpo_name,
        dpo_email=statement.dpo_email,
        introduction=statement.introduction,
        data_collected=statement.data_collected,
        data_purpose=statement.data_purpose,
        legal_basis=statement.legal_basis,
        data_sharing=statement.data_sharing,
        retention_period=statement.retention_period,
        rights=statement.rights,
        cookies=statement.cookies,
        security=statement.security,
        complaints=statement.complaints,
        changes=statement.changes,
        status=PrivacyStatementStatus(statement.status.value),
        published_at=statement.published_at,
        created_by_id=statement.created_by_id,
        created_by_name=f"{current_user.first_name} {current_user.last_name}",
        created_at=statement.created_at,
        updated_at=statement.updated_at,
    )


@router.get(
    "/statements",
    response_model=list[PrivacyStatementListResponse],
    summary="Lijst van privacy statements",
)
async def list_privacy_statements(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: PrivacyStatementStatus | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[PrivacyStatementListResponse]:
    """Get list of privacy statements."""
    query = select(PrivacyStatement).where(PrivacyStatement.vve_id == vve_id)

    if status_filter:
        query = query.where(
            PrivacyStatement.status == DBPrivacyStatementStatus(status_filter.value)
        )

    query = query.order_by(PrivacyStatement.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    statements = result.scalars().all()

    return [
        PrivacyStatementListResponse(
            id=s.id,
            vve_id=s.vve_id,
            title=s.title,
            version=s.version,
            status=PrivacyStatementStatus(s.status.value),
            published_at=s.published_at,
            created_at=s.created_at,
        )
        for s in statements
    ]


@router.get(
    "/statements/current",
    response_model=PrivacyStatementResponse | None,
    summary="Huidige gepubliceerde privacy statement",
)
async def get_current_privacy_statement(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse | None:
    """Get the current published privacy statement."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.vve_id == vve_id,
            PrivacyStatement.status == DBPrivacyStatementStatus.PUBLISHED,
        ).order_by(PrivacyStatement.published_at.desc())
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        return None

    # Get creator name
    created_by_name = None
    if statement.created_by_id:
        user_result = await db.execute(select(User).where(User.id == statement.created_by_id))
        user = user_result.scalar_one_or_none()
        if user:
            created_by_name = f"{user.first_name} {user.last_name}"

    return PrivacyStatementResponse(
        id=statement.id,
        vve_id=statement.vve_id,
        title=statement.title,
        version=statement.version,
        vve_name=statement.vve_name,
        vve_address=statement.vve_address,
        contact_email=statement.contact_email,
        contact_phone=statement.contact_phone,
        dpo_name=statement.dpo_name,
        dpo_email=statement.dpo_email,
        introduction=statement.introduction,
        data_collected=statement.data_collected,
        data_purpose=statement.data_purpose,
        legal_basis=statement.legal_basis,
        data_sharing=statement.data_sharing,
        retention_period=statement.retention_period,
        rights=statement.rights,
        cookies=statement.cookies,
        security=statement.security,
        complaints=statement.complaints,
        changes=statement.changes,
        status=PrivacyStatementStatus(statement.status.value),
        published_at=statement.published_at,
        created_by_id=statement.created_by_id,
        created_by_name=created_by_name,
        created_at=statement.created_at,
        updated_at=statement.updated_at,
    )


@router.get(
    "/statements/{statement_id}",
    response_model=PrivacyStatementResponse,
    summary="Privacy statement details",
)
async def get_privacy_statement(
    vve_id: uuid.UUID,
    statement_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse:
    """Get privacy statement details."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.id == statement_id,
            PrivacyStatement.vve_id == vve_id,
        )
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        raise HTTPException(status_code=404, detail="Privacy statement niet gevonden")

    # Get creator name
    created_by_name = None
    if statement.created_by_id:
        user_result = await db.execute(select(User).where(User.id == statement.created_by_id))
        user = user_result.scalar_one_or_none()
        if user:
            created_by_name = f"{user.first_name} {user.last_name}"

    return PrivacyStatementResponse(
        id=statement.id,
        vve_id=statement.vve_id,
        title=statement.title,
        version=statement.version,
        vve_name=statement.vve_name,
        vve_address=statement.vve_address,
        contact_email=statement.contact_email,
        contact_phone=statement.contact_phone,
        dpo_name=statement.dpo_name,
        dpo_email=statement.dpo_email,
        introduction=statement.introduction,
        data_collected=statement.data_collected,
        data_purpose=statement.data_purpose,
        legal_basis=statement.legal_basis,
        data_sharing=statement.data_sharing,
        retention_period=statement.retention_period,
        rights=statement.rights,
        cookies=statement.cookies,
        security=statement.security,
        complaints=statement.complaints,
        changes=statement.changes,
        status=PrivacyStatementStatus(statement.status.value),
        published_at=statement.published_at,
        created_by_id=statement.created_by_id,
        created_by_name=created_by_name,
        created_at=statement.created_at,
        updated_at=statement.updated_at,
    )


@router.put(
    "/statements/{statement_id}",
    response_model=PrivacyStatementResponse,
    summary="Privacy statement wijzigen",
)
async def update_privacy_statement(
    vve_id: uuid.UUID,
    statement_id: uuid.UUID,
    update_data: PrivacyStatementUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse:
    """Update a privacy statement (only allowed when in draft status)."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.id == statement_id,
            PrivacyStatement.vve_id == vve_id,
        )
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        raise HTTPException(status_code=404, detail="Privacy statement niet gevonden")

    # Can only edit draft statements (unless just changing status)
    if statement.status != DBPrivacyStatementStatus.DRAFT and update_data.status is None:
        raise HTTPException(
            status_code=400,
            detail="Alleen concept-statements kunnen worden gewijzigd"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "status" and value is not None:
            setattr(statement, field, DBPrivacyStatementStatus(value.value))
        else:
            setattr(statement, field, value)

    await db.commit()
    await db.refresh(statement)

    return await get_privacy_statement(vve_id, statement_id, current_user, db)


@router.post(
    "/statements/{statement_id}/publish",
    response_model=PrivacyStatementResponse,
    summary="Privacy statement publiceren",
    description="Publiceer het privacy statement op het eigenaren-portal.",
)
async def publish_privacy_statement(
    vve_id: uuid.UUID,
    statement_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse:
    """Publish a privacy statement."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.id == statement_id,
            PrivacyStatement.vve_id == vve_id,
        )
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        raise HTTPException(status_code=404, detail="Privacy statement niet gevonden")

    if statement.status == DBPrivacyStatementStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Statement is al gepubliceerd")

    # Archive any existing published statement
    existing_published = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.vve_id == vve_id,
            PrivacyStatement.status == DBPrivacyStatementStatus.PUBLISHED,
            PrivacyStatement.id != statement_id,
        )
    )
    for old_statement in existing_published.scalars().all():
        old_statement.status = DBPrivacyStatementStatus.ARCHIVED

    statement.status = DBPrivacyStatementStatus.PUBLISHED
    statement.published_at = datetime.now(timezone.utc)
    await db.commit()

    return await get_privacy_statement(vve_id, statement_id, current_user, db)


@router.post(
    "/statements/{statement_id}/archive",
    response_model=PrivacyStatementResponse,
    summary="Privacy statement archiveren",
)
async def archive_privacy_statement(
    vve_id: uuid.UUID,
    statement_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PrivacyStatementResponse:
    """Archive a privacy statement."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.id == statement_id,
            PrivacyStatement.vve_id == vve_id,
        )
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        raise HTTPException(status_code=404, detail="Privacy statement niet gevonden")

    if statement.status == DBPrivacyStatementStatus.ARCHIVED:
        raise HTTPException(status_code=400, detail="Statement is al gearchiveerd")

    statement.status = DBPrivacyStatementStatus.ARCHIVED
    await db.commit()

    return await get_privacy_statement(vve_id, statement_id, current_user, db)


@router.delete(
    "/statements/{statement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Privacy statement verwijderen",
)
async def delete_privacy_statement(
    vve_id: uuid.UUID,
    statement_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a privacy statement (only allowed when in draft status)."""
    result = await db.execute(
        select(PrivacyStatement).where(
            PrivacyStatement.id == statement_id,
            PrivacyStatement.vve_id == vve_id,
        )
    )
    statement = result.scalar_one_or_none()

    if statement is None:
        raise HTTPException(status_code=404, detail="Privacy statement niet gevonden")

    if statement.status != DBPrivacyStatementStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Alleen concept-statements kunnen worden verwijderd"
        )

    await db.delete(statement)
    await db.commit()


@router.get(
    "/template",
    response_model=PrivacyStatementTemplate,
    summary="Privacy statement template ophalen",
    description="Haal de standaard template op voor een privacy statement.",
)
async def get_privacy_statement_template(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
) -> PrivacyStatementTemplate:
    """Get the default privacy statement template."""
    return PrivacyStatementTemplate()


# ============================================================================
# Data Export (STORY-122)
# ============================================================================


@router.post(
    "/data-export",
    response_model=DataExportConfirmation,
    status_code=status.HTTP_201_CREATED,
    summary="Data export aanvragen",
    description="""
    STORY-122: Als eigenaar wil ik een export van al mijn persoonsgegevens kunnen aanvragen.
    
    - Aanvraag wordt verwerkt binnen 24 uur
    - Download link beschikbaar 7 dagen
    - Alle persoonsgegevens in leesbaar formaat (JSON of CSV)
    """,
)
async def request_data_export(
    vve_id: uuid.UUID,
    export_data: DataExportRequestCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DataExportConfirmation:
    """Request a data export (STORY-122)."""
    import secrets
    from datetime import timedelta

    # Verify VVE exists if specified
    target_vve_id = export_data.vve_id or vve_id
    vve_result = await db.execute(select(VVE).where(VVE.id == target_vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    # Verify user is a member of the VVE
    member_result = await db.execute(
        select(VVEMember).where(
            VVEMember.user_id == current_user.id,
            VVEMember.vve_id == target_vve_id,
            VVEMember.is_active.is_(True),
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=403,
            detail="U bent geen lid van deze VVE"
        )

    # Check for existing pending/processing request
    existing = await db.execute(
        select(DataExportRequest).where(
            DataExportRequest.user_id == current_user.id,
            DataExportRequest.status.in_([DBDataExportStatus.PENDING, DBDataExportStatus.PROCESSING]),
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400,
            detail="Er is al een data export aanvraag in behandeling"
        )

    # Create export request
    export_request = DataExportRequest(
        user_id=current_user.id,
        vve_id=target_vve_id,
        export_format=DBDataExportFormat(export_data.export_format.value),
        download_token=secrets.token_urlsafe(32),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(export_request)
    await db.commit()
    await db.refresh(export_request)

    return DataExportConfirmation(
        request_id=export_request.id,
        status=DataExportStatus(export_request.status.value),
        message="Uw data export aanvraag is ontvangen. U ontvangt een email zodra de export klaar is.",
        estimated_completion_minutes=60,
    )


@router.get(
    "/data-export",
    response_model=list[DataExportRequestListResponse],
    summary="Lijst van data export aanvragen",
)
async def list_data_export_requests(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[DataExportRequestListResponse]:
    """Get list of data export requests for the current user."""
    result = await db.execute(
        select(DataExportRequest).where(
            DataExportRequest.user_id == current_user.id,
        ).order_by(DataExportRequest.created_at.desc())
        .offset(skip).limit(limit)
    )
    requests = result.scalars().all()

    now = datetime.now(timezone.utc)
    response = []
    for req in requests:
        vve_name = None
        if req.vve_id:
            vve_result = await db.execute(select(VVE).where(VVE.id == req.vve_id))
            vve = vve_result.scalar_one_or_none()
            if vve:
                vve_name = vve.name

        is_expired = req.expires_at is not None and req.expires_at < now
        is_ready = req.status == DBDataExportStatus.COMPLETED and not is_expired

        response.append(
            DataExportRequestListResponse(
                id=req.id,
                vve_id=req.vve_id,
                vve_name=vve_name,
                status=DataExportStatus(req.status.value),
                export_format=DataExportFormat(req.export_format.value),
                file_size_bytes=req.file_size_bytes,
                expires_at=req.expires_at,
                created_at=req.created_at,
                is_ready=is_ready,
                is_expired=is_expired,
            )
        )

    return response


@router.get(
    "/data-export/{request_id}",
    response_model=DataExportRequestResponse,
    summary="Data export status",
)
async def get_data_export_request(
    vve_id: uuid.UUID,
    request_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DataExportRequestResponse:
    """Get data export request details."""
    result = await db.execute(
        select(DataExportRequest).where(
            DataExportRequest.id == request_id,
            DataExportRequest.user_id == current_user.id,
        )
    )
    export_request = result.scalar_one_or_none()

    if export_request is None:
        raise HTTPException(status_code=404, detail="Data export aanvraag niet gevonden")

    now = datetime.now(timezone.utc)
    is_expired = export_request.expires_at is not None and export_request.expires_at < now
    is_ready = export_request.status == DBDataExportStatus.COMPLETED and not is_expired

    # Generate download URL if ready
    download_url = None
    if is_ready and export_request.download_token:
        # In production, this would be a signed S3 URL or similar
        download_url = f"/api/v1/vves/{vve_id}/privacy/data-export/{request_id}/download"

    return DataExportRequestResponse(
        id=export_request.id,
        user_id=export_request.user_id,
        vve_id=export_request.vve_id,
        status=DataExportStatus(export_request.status.value),
        export_format=DataExportFormat(export_request.export_format.value),
        file_size_bytes=export_request.file_size_bytes,
        download_count=export_request.download_count,
        expires_at=export_request.expires_at,
        processing_started_at=export_request.processing_started_at,
        processing_completed_at=export_request.processing_completed_at,
        error_message=export_request.error_message,
        created_at=export_request.created_at,
        updated_at=export_request.updated_at,
        is_ready=is_ready,
        is_expired=is_expired,
        download_url=download_url,
    )


@router.delete(
    "/data-export/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Data export aanvraag annuleren",
)
async def cancel_data_export_request(
    vve_id: uuid.UUID,
    request_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Cancel a pending data export request."""
    result = await db.execute(
        select(DataExportRequest).where(
            DataExportRequest.id == request_id,
            DataExportRequest.user_id == current_user.id,
        )
    )
    export_request = result.scalar_one_or_none()

    if export_request is None:
        raise HTTPException(status_code=404, detail="Data export aanvraag niet gevonden")

    if export_request.status not in [DBDataExportStatus.PENDING]:
        raise HTTPException(
            status_code=400,
            detail="Alleen wachtende aanvragen kunnen worden geannuleerd"
        )

    await db.delete(export_request)
    await db.commit()
