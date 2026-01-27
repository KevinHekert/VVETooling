"""Splitsingsakte Version API routes.

Implements FEAT-019 (Splitsingsakte versiebeheer) and STORY-041 (Splitsingsakte versies overzicht).
"""

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.core.security import UserRole
from app.db.models.models import (
    Document,
    SplitsingsakteVersion,
    SplitsingsakteVersionStatus as DBSplitsingsakteVersionStatus,
    User,
    VVE,
)
from app.db.session import get_db
from app.schemas.splitsingsakte import (
    SplitsingsakteVersionCreate,
    SplitsingsakteVersionListResponse,
    SplitsingsakteVersionResponse,
    SplitsingsakteVersionStatus,
    SplitsingsakteVersionUpdate,
)

router = APIRouter(prefix="/vves/{vve_id}/splitsingsakte-versions", tags=["splitsingsakte"])


async def _get_next_version_number(db: AsyncSession, vve_id: uuid.UUID) -> int:
    """Get the next version number for a VVE's splitsingsakte."""
    result = await db.execute(
        select(func.max(SplitsingsakteVersion.version_number))
        .where(SplitsingsakteVersion.vve_id == vve_id)
    )
    max_version = result.scalar()
    return (max_version or 0) + 1


@router.get(
    "",
    response_model=list[SplitsingsakteVersionListResponse],
    summary="Splitsingsakte versies ophalen",
    description="""
    STORY-041: Als bestuurslid wil ik een overzicht van alle splitsingsakte-versies zien.
    
    - Bewoners zien alleen de actieve versie
    - Bestuur/beheerder ziet alle versies
    """,
)
async def list_splitsingsakte_versions(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    include_archived: bool = Query(False, description="Inclusief gearchiveerde versies"),
) -> list[SplitsingsakteVersionListResponse]:
    """Get all splitsingsakte versions for a VVE.
    
    Bewoners only see the active version.
    Bestuur/beheerder see all versions.
    """
    user_role = current_user.get_role_for_vve(vve_id)
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder", "penningmeester"]
    
    query = select(SplitsingsakteVersion).where(SplitsingsakteVersion.vve_id == vve_id)
    
    # Bewoners only see active version
    if not is_staff:
        query = query.where(
            SplitsingsakteVersion.status == DBSplitsingsakteVersionStatus.ACTIVE
        )
    elif not include_archived:
        # Staff can optionally include archived
        query = query.where(
            SplitsingsakteVersion.status != DBSplitsingsakteVersionStatus.ARCHIVED
        )
    
    query = query.order_by(SplitsingsakteVersion.version_number.desc())
    
    result = await db.execute(query)
    versions = result.scalars().all()
    
    responses = []
    for version in versions:
        response = SplitsingsakteVersionListResponse(
            id=version.id,
            vve_id=version.vve_id,
            version_number=version.version_number,
            name=version.name,
            status=SplitsingsakteVersionStatus(version.status.value),
            effective_date=version.effective_date,
            created_at=version.created_at,
            is_active=version.status == DBSplitsingsakteVersionStatus.ACTIVE,
        )
        responses.append(response)
    
    return responses


@router.post(
    "",
    response_model=SplitsingsakteVersionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Splitsingsakte versie toevoegen",
    description="Voeg een nieuwe splitsingsakte versie toe. Alleen bestuur/beheerder.",
)
async def create_splitsingsakte_version(
    vve_id: uuid.UUID,
    version_data: SplitsingsakteVersionCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingsakteVersionResponse:
    """Create a new splitsingsakte version."""
    # Validate VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )
    
    # Validate document if provided
    document_name = None
    if version_data.document_id:
        doc_result = await db.execute(
            select(Document).where(
                Document.id == version_data.document_id,
                Document.vve_id == vve_id,
            )
        )
        document = doc_result.scalar_one_or_none()
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document niet gevonden",
            )
        document_name = document.title
    
    # Get next version number
    version_number = await _get_next_version_number(db, vve_id)
    
    version = SplitsingsakteVersion(
        vve_id=vve_id,
        version_number=version_number,
        name=version_data.name,
        description=version_data.description,
        effective_date=version_data.effective_date,
        document_id=version_data.document_id,
        created_by_id=current_user.id,
        status=DBSplitsingsakteVersionStatus.DRAFT,
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)
    
    response = SplitsingsakteVersionResponse.model_validate(version)
    response.created_by_name = f"{current_user.first_name} {current_user.last_name}"
    response.document_name = document_name
    
    return response


@router.get(
    "/{version_id}",
    response_model=SplitsingsakteVersionResponse,
    summary="Splitsingsakte versie ophalen",
    description="Haal details op van een specifieke versie.",
)
async def get_splitsingsakte_version(
    vve_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingsakteVersionResponse:
    """Get a specific splitsingsakte version."""
    result = await db.execute(
        select(SplitsingsakteVersion).where(
            SplitsingsakteVersion.id == version_id,
            SplitsingsakteVersion.vve_id == vve_id,
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versie niet gevonden",
        )
    
    # Bewoners can only see active version
    user_role = current_user.get_role_for_vve(vve_id)
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder", "penningmeester"]
    
    if not is_staff and version.status != DBSplitsingsakteVersionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot deze versie",
        )
    
    # Get creator name
    creator_result = await db.execute(
        select(User).where(User.id == version.created_by_id)
    )
    creator = creator_result.scalar_one_or_none()
    
    # Get activator name
    activator_name = None
    if version.activated_by_id:
        activator_result = await db.execute(
            select(User).where(User.id == version.activated_by_id)
        )
        activator = activator_result.scalar_one_or_none()
        activator_name = f"{activator.first_name} {activator.last_name}" if activator else None
    
    # Get document name
    document_name = None
    if version.document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == version.document_id)
        )
        document = doc_result.scalar_one_or_none()
        document_name = document.title if document else None
    
    response = SplitsingsakteVersionResponse.model_validate(version)
    response.created_by_name = f"{creator.first_name} {creator.last_name}" if creator else None
    response.activated_by_name = activator_name
    response.document_name = document_name
    
    return response


@router.put(
    "/{version_id}",
    response_model=SplitsingsakteVersionResponse,
    summary="Splitsingsakte versie bijwerken",
    description="Werk een splitsingsakte versie bij. Alleen concept-versies kunnen worden bewerkt.",
)
async def update_splitsingsakte_version(
    vve_id: uuid.UUID,
    version_id: uuid.UUID,
    update_data: SplitsingsakteVersionUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingsakteVersionResponse:
    """Update a splitsingsakte version."""
    result = await db.execute(
        select(SplitsingsakteVersion).where(
            SplitsingsakteVersion.id == version_id,
            SplitsingsakteVersion.vve_id == vve_id,
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versie niet gevonden",
        )
    
    # Only draft versions can be edited
    if version.status != DBSplitsingsakteVersionStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen concept-versies kunnen worden bewerkt",
        )
    
    # Validate document if provided
    document_name = None
    if update_data.document_id:
        doc_result = await db.execute(
            select(Document).where(
                Document.id == update_data.document_id,
                Document.vve_id == vve_id,
            )
        )
        document = doc_result.scalar_one_or_none()
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document niet gevonden",
            )
        document_name = document.title
        version.document_id = update_data.document_id
    
    # Update fields
    if update_data.name is not None:
        version.name = update_data.name
    if update_data.description is not None:
        version.description = update_data.description
    if update_data.effective_date is not None:
        version.effective_date = update_data.effective_date
    
    await db.commit()
    await db.refresh(version)
    
    # Get names
    creator_result = await db.execute(
        select(User).where(User.id == version.created_by_id)
    )
    creator = creator_result.scalar_one_or_none()
    
    response = SplitsingsakteVersionResponse.model_validate(version)
    response.created_by_name = f"{creator.first_name} {creator.last_name}" if creator else None
    response.document_name = document_name
    
    return response


@router.post(
    "/{version_id}/activate",
    response_model=SplitsingsakteVersionResponse,
    summary="Splitsingsakte versie activeren",
    description="""
    Activeer een splitsingsakte versie. 
    De huidige actieve versie wordt automatisch gearchiveerd.
    Dit wordt gelogd in de audit trail.
    """,
)
async def activate_splitsingsakte_version(
    vve_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingsakteVersionResponse:
    """Activate a splitsingsakte version."""
    result = await db.execute(
        select(SplitsingsakteVersion).where(
            SplitsingsakteVersion.id == version_id,
            SplitsingsakteVersion.vve_id == vve_id,
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versie niet gevonden",
        )
    
    if version.status == DBSplitsingsakteVersionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deze versie is al actief",
        )
    
    if version.status == DBSplitsingsakteVersionStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gearchiveerde versies kunnen niet worden geactiveerd",
        )
    
    # Archive current active version
    current_active = await db.execute(
        select(SplitsingsakteVersion).where(
            SplitsingsakteVersion.vve_id == vve_id,
            SplitsingsakteVersion.status == DBSplitsingsakteVersionStatus.ACTIVE,
        )
    )
    current_active_version = current_active.scalar_one_or_none()
    
    if current_active_version:
        current_active_version.status = DBSplitsingsakteVersionStatus.ARCHIVED
        current_active_version.archived_date = datetime.now(timezone.utc)
    
    # Activate the new version
    version.status = DBSplitsingsakteVersionStatus.ACTIVE
    version.activated_by_id = current_user.id
    version.activated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(version)
    
    # Get names
    creator_result = await db.execute(
        select(User).where(User.id == version.created_by_id)
    )
    creator = creator_result.scalar_one_or_none()
    
    # Get document name
    document_name = None
    if version.document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == version.document_id)
        )
        document = doc_result.scalar_one_or_none()
        document_name = document.title if document else None
    
    response = SplitsingsakteVersionResponse.model_validate(version)
    response.created_by_name = f"{creator.first_name} {creator.last_name}" if creator else None
    response.activated_by_name = f"{current_user.first_name} {current_user.last_name}"
    response.document_name = document_name
    
    return response


@router.post(
    "/{version_id}/archive",
    response_model=SplitsingsakteVersionResponse,
    summary="Splitsingsakte versie archiveren",
    description="Archiveer een splitsingsakte versie. Alleen niet-actieve versies kunnen worden gearchiveerd.",
)
async def archive_splitsingsakte_version(
    vve_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingsakteVersionResponse:
    """Archive a splitsingsakte version."""
    result = await db.execute(
        select(SplitsingsakteVersion).where(
            SplitsingsakteVersion.id == version_id,
            SplitsingsakteVersion.vve_id == vve_id,
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versie niet gevonden",
        )
    
    if version.status == DBSplitsingsakteVersionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Actieve versies kunnen niet worden gearchiveerd. Activeer eerst een andere versie.",
        )
    
    if version.status == DBSplitsingsakteVersionStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deze versie is al gearchiveerd",
        )
    
    version.status = DBSplitsingsakteVersionStatus.ARCHIVED
    version.archived_date = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(version)
    
    # Get names
    creator_result = await db.execute(
        select(User).where(User.id == version.created_by_id)
    )
    creator = creator_result.scalar_one_or_none()
    
    response = SplitsingsakteVersionResponse.model_validate(version)
    response.created_by_name = f"{creator.first_name} {creator.last_name}" if creator else None
    
    return response
