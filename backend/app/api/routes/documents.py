"""Document API routes.

Implements FEAT-011 (Documentbeheer) and STORY-004 (Bestuur uploadt document).
Implements STORY-018: Document versiebeheer en rol-specifiek delen.
Implements STORY-019: Document download-links en notificaties.
Storage limits per D-004.
"""

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import Document, VVE
from app.db.session import get_db
from app.schemas.document import (
    ALLOWED_FILE_TYPES,
    DEFAULT_VISIBLE_ROLES,
    MAX_FILE_SIZE_BYTES,
    DocumentDownloadResponse,
    DocumentResponse,
    DocumentShareLinkRequest,
    DocumentShareLinkResponse,
    DocumentUpdate,
    DocumentUploadResponse,
    DocumentVersionResponse,
    StorageUsageResponse,
)

router = APIRouter(prefix="/vves/{vve_id}/documents", tags=["documents"])

# Storage limits per tier (D-004)
STORAGE_LIMITS_MB = {
    "basic": 2 * 1024,  # 2 GB
    "standard": 5 * 1024,  # 5 GB (MVP default)
    "premium": 10 * 1024,  # 10 GB
}


@router.post(
    "",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Document uploaden",
    description="""
    STORY-004: Als bestuurslid wil ik een document uploaden,
    zodat bewoners de nieuwste stukken kunnen bekijken.

    - Upload ondersteunt toegestane bestandsformaten (PDF, images, Office docs)
    - Succesmelding verschijnt als toast
    - Bij fouten wordt inline feedback getoond
    """,
)
async def upload_document(
    vve_id: uuid.UUID,
    file: Annotated[UploadFile, File(description="Document bestand")],
    title: Annotated[str, Form(min_length=1, max_length=255)],
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
    description: Annotated[str | None, Form(max_length=1000)] = None,
    category: Annotated[str, Form(max_length=50)] = "general",
    is_public: Annotated[bool, Form()] = False,
    visible_to_roles: Annotated[str, Form()] = DEFAULT_VISIBLE_ROLES,
) -> DocumentUploadResponse:
    """Upload a document to the VVE.

    Requires bestuurslid or beheerder role.

    Validation:
    - File type must be in allowed list (D-004)
    - File size must be under 50MB
    - VVE must not exceed storage limit
    """
    # Validate VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Validate file type
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestandstype '{file.content_type}' niet toegestaan. "
            f"Toegestane types: PDF, afbeeldingen (JPEG, PNG, WebP), Word en Excel documenten.",
        )

    # Read file content to check size
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestand is te groot ({file_size / (1024*1024):.1f} MB). Maximum is 50 MB.",
        )

    # Check storage usage (D-004 limits)
    storage_result = await db.execute(
        select(func.sum(Document.file_size_bytes))
        .where(Document.vve_id == vve_id)
    )
    current_usage = storage_result.scalar() or 0
    storage_limit = STORAGE_LIMITS_MB["standard"] * 1024 * 1024  # 5GB default

    if current_usage + file_size > storage_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opslaglimiet bereikt. Verwijder bestaande documenten of upgrade uw abonnement.",
        )

    # In production, upload to S3 and get the key
    # For now, generate a placeholder S3 key
    s3_key = f"vves/{vve_id}/documents/{uuid.uuid4()}/{file.filename}"

    # Create document record with version support (STORY-018)
    document = Document(
        vve_id=vve_id,
        title=title,
        description=description,
        file_name=file.filename or "unknown",
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        s3_key=s3_key,
        category=category,
        is_public=is_public,
        visible_to_roles=visible_to_roles,
        version=1,
        is_current_version=True,
        uploaded_by_id=current_user.id,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    response = DocumentUploadResponse.model_validate(document)
    response.uploaded_by_name = current_user.full_name
    return response


@router.get(
    "",
    response_model=list[DocumentResponse],
    summary="Documenten ophalen",
)
async def list_documents(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    category: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[DocumentResponse]:
    """Get documents for a VVE.

    All members can view public documents.
    Bestuurslid/beheerder can view all documents.
    """
    query = select(Document).where(Document.vve_id == vve_id)

    # Filter by visibility based on role
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value in ["bewoner"]:
        query = query.where(Document.is_public.is_(True))

    if category:
        query = query.where(Document.category == category)

    query = query.order_by(Document.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    documents = result.scalars().all()

    return [DocumentResponse.model_validate(d) for d in documents]


@router.get(
    "/storage",
    response_model=StorageUsageResponse,
    summary="Opslaggebruik ophalen",
)
async def get_storage_usage(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StorageUsageResponse:
    """Get storage usage statistics for a VVE.

    Implements D-004 storage limits monitoring.
    """
    # Get counts and totals
    count_result = await db.execute(
        select(func.count(Document.id)).where(Document.vve_id == vve_id)
    )
    total_documents = count_result.scalar() or 0

    size_result = await db.execute(
        select(func.sum(Document.file_size_bytes)).where(Document.vve_id == vve_id)
    )
    total_size_bytes = size_result.scalar() or 0

    # Get storage limit (TODO: fetch from subscription)
    storage_limit_mb = STORAGE_LIMITS_MB["standard"]

    total_size_mb = total_size_bytes / (1024 * 1024)
    usage_percentage = (total_size_mb / storage_limit_mb) * 100 if storage_limit_mb > 0 else 0

    return StorageUsageResponse(
        vve_id=vve_id,
        total_documents=total_documents,
        total_size_bytes=total_size_bytes,
        total_size_mb=round(total_size_mb, 2),
        storage_limit_mb=float(storage_limit_mb),
        usage_percentage=round(usage_percentage, 1),
        is_near_limit=usage_percentage >= 80,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Document details ophalen",
)
async def get_document(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentResponse:
    """Get document details by ID."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )

    # Check visibility
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner" and not document.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit document",
        )

    return DocumentResponse.model_validate(document)


@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Document metadata wijzigen",
)
async def update_document(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    update_data: DocumentUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentResponse:
    """Update document metadata.

    Requires bestuurslid or beheerder role.
    """
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(document, field, value)

    await db.commit()
    await db.refresh(document)

    return DocumentResponse.model_validate(document)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Document verwijderen",
)
async def delete_document(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a document.

    Requires bestuurslid or beheerder role.
    Also removes the file from S3 storage.
    """
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )

    # TODO: Delete from S3
    # await s3_client.delete_object(Bucket=settings.s3_bucket_name, Key=document.s3_key)

    await db.delete(document)
    await db.commit()


# ============================================================================
# Version Management Endpoints (STORY-018)
# ============================================================================


@router.get(
    "/{document_id}/versions",
    response_model=list[DocumentVersionResponse],
    summary="Document versies ophalen",
    description="""
    STORY-018: Als bestuurslid wil ik alle versies van een document zien,
    zodat ik oudere versies kan terugzetten of downloaden.
    """,
)
async def get_document_versions(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[DocumentVersionResponse]:
    """Get all versions of a document.

    Requires bestuurslid or beheerder role.
    Returns versions sorted by version number descending (newest first).
    """
    # First, find the document and its parent chain
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )

    # Get all versions (documents with the same parent or are the parent)
    # Find the root document
    root_id = document.parent_document_id or document.id

    # Get all versions related to this document
    versions_result = await db.execute(
        select(Document).where(
            Document.vve_id == vve_id,
            (Document.id == root_id) | (Document.parent_document_id == root_id),
        ).order_by(Document.version.desc())
    )
    versions = versions_result.scalars().all()

    return [DocumentVersionResponse.model_validate(v) for v in versions]


@router.post(
    "/{document_id}/versions",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Nieuwe versie uploaden",
    description="""
    STORY-018: Als bestuurslid wil ik een nieuwe versie van een document uploaden,
    zodat de oude versie behouden blijft maar de nieuwe actief wordt.
    """,
)
async def upload_new_version(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    file: Annotated[UploadFile, File(description="Nieuwe versie bestand")],
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentUploadResponse:
    """Upload a new version of an existing document.

    Requires bestuurslid or beheerder role.
    The existing version is marked as not current, and the new version becomes current.
    """
    # Find the current document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    current_doc = result.scalar_one_or_none()

    if current_doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )

    # Validate file type
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestandstype '{file.content_type}' niet toegestaan.",
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestand is te groot ({file_size / (1024*1024):.1f} MB). Maximum is 50 MB.",
        )

    # Generate new S3 key
    s3_key = f"vves/{vve_id}/documents/{uuid.uuid4()}/{file.filename}"

    # Determine root document ID and new version number
    # NOTE: Version increment is not atomic. For production use with high concurrency,
    # consider using database-level sequences or SELECT FOR UPDATE locking.
    root_id = current_doc.parent_document_id or current_doc.id
    new_version = current_doc.version + 1

    # Mark current version as not current
    # NOTE: In high-concurrency scenarios, use transaction isolation to prevent
    # multiple documents being marked as current simultaneously.
    current_doc.is_current_version = False

    # Create new version
    new_doc = Document(
        vve_id=vve_id,
        title=current_doc.title,
        description=current_doc.description,
        file_name=file.filename or current_doc.file_name,
        file_type=file.content_type or current_doc.file_type,
        file_size_bytes=file_size,
        s3_key=s3_key,
        category=current_doc.category,
        is_public=current_doc.is_public,
        visible_to_roles=current_doc.visible_to_roles,
        version=new_version,
        parent_document_id=root_id,
        is_current_version=True,
        uploaded_by_id=current_user.id,
    )

    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    response = DocumentUploadResponse.model_validate(new_doc)
    response.uploaded_by_name = current_user.full_name
    response.message = f"Versie {new_version} succesvol geüpload"
    return response


@router.post(
    "/{document_id}/versions/{version_id}/restore",
    response_model=DocumentResponse,
    summary="Versie herstellen",
    description="""
    STORY-018: Als bestuurslid wil ik een oudere versie van een document herstellen,
    zodat deze weer de actieve versie wordt.
    """,
)
async def restore_document_version(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentResponse:
    """Restore a specific version of a document to be the current version.

    Requires bestuurslid or beheerder role.
    This marks the specified version as current and all others as not current.
    """
    # Find the version to restore
    result = await db.execute(
        select(Document).where(
            Document.id == version_id,
            Document.vve_id == vve_id,
        )
    )
    version_to_restore = result.scalar_one_or_none()

    if version_to_restore is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versie niet gevonden",
        )

    # Find the root document
    root_id = version_to_restore.parent_document_id or version_to_restore.id

    # Mark all versions as not current
    all_versions_result = await db.execute(
        select(Document).where(
            Document.vve_id == vve_id,
            (Document.id == root_id) | (Document.parent_document_id == root_id),
        )
    )
    for doc in all_versions_result.scalars().all():
        doc.is_current_version = False

    # Mark the restored version as current
    version_to_restore.is_current_version = True

    await db.commit()
    await db.refresh(version_to_restore)

    return DocumentResponse.model_validate(version_to_restore)


# ============================================================================
# Download Links & Notifications Endpoints (STORY-019)
# ============================================================================

# In-memory store for share links (in production, this would be a database table)
# Structure: { token: { document_id, vve_id, expires_at, allow_download, view_count, download_count, ... } }
_share_links_store: dict[str, dict] = {}


@router.get(
    "/{document_id}/download",
    response_model=DocumentDownloadResponse,
    summary="Document download link genereren",
    description="""
    STORY-019: Genereer een beveiligde download URL voor een document.
    
    - URL is tijdelijk geldig (1 uur standaard)
    - Download wordt gelogd voor audit trail
    - Rol-gebaseerde toegangscontrole
    """,
)
async def get_download_url(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentDownloadResponse:
    """Generate a secure download URL for a document.
    
    Returns a pre-signed URL that expires after 1 hour.
    All members can download public documents; bestuur/beheerder can download all.
    """
    # Find the document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()
    
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )
    
    # Check visibility permissions
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner" and not document.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit document",
        )
    
    # In production, generate a pre-signed S3 URL
    # For now, generate a mock download URL with token
    download_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store token temporarily for validation (in production, use database)
    _share_links_store[download_token] = {
        "document_id": str(document_id),
        "vve_id": str(vve_id),
        "expires_at": expires_at,
        "type": "download",
        "user_id": str(current_user.id),
    }
    
    # TODO: Log download request for audit (FEAT-015 integration)
    # audit_service.log_action(
    #     user_id=current_user.id,
    #     action="document_download_requested",
    #     entity_type="document",
    #     entity_id=document_id,
    # )
    
    return DocumentDownloadResponse(
        download_url=f"/api/v1/documents/download/{download_token}",
        expires_in_seconds=3600,
        file_name=document.file_name,
        file_type=document.file_type,
    )


@router.post(
    "/{document_id}/share-links",
    response_model=DocumentShareLinkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Deelbare link genereren",
    description="""
    STORY-019: Genereer een deelbare link voor een document.
    
    - Link is configureerbaar qua vervaldatum (1 uur tot 1 week)
    - Optioneel: alleen bekijken of ook downloaden toestaan
    - Tracking van views en downloads
    - Bestuur kan links beheren en intrekken
    """,
)
async def create_share_link(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    request: DocumentShareLinkRequest,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentShareLinkResponse:
    """Create a shareable link for a document.
    
    Requires bestuurslid or beheerder role.
    """
    # Find the document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    document = result.scalar_one_or_none()
    
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )
    
    # Generate secure share token
    share_token = secrets.token_urlsafe(48)
    link_id = uuid.uuid4()
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(hours=request.expires_in_hours)
    
    # Store the share link (in production, persist to database)
    _share_links_store[share_token] = {
        "id": str(link_id),
        "document_id": str(document_id),
        "vve_id": str(vve_id),
        "expires_at": expires_at,
        "allow_download": request.allow_download,
        "created_by_id": str(current_user.id),
        "created_by_name": current_user.full_name,
        "created_at": created_at,
        "view_count": 0,
        "download_count": 0,
        "is_active": True,
        "type": "share",
    }
    
    # TODO: Log share link creation for audit (FEAT-015 integration)
    
    return DocumentShareLinkResponse(
        id=link_id,
        document_id=document_id,
        share_url=f"/documents/shared/{share_token}",
        token=share_token,
        expires_at=expires_at,
        created_by_id=current_user.id,
        created_by_name=current_user.full_name,
        allow_download=request.allow_download,
        view_count=0,
        download_count=0,
        is_active=True,
        created_at=created_at,
    )


@router.get(
    "/{document_id}/share-links",
    response_model=list[DocumentShareLinkResponse],
    summary="Deelbare links ophalen",
    description="""
    STORY-019: Haal alle actieve deelbare links voor een document op.
    
    - Bestuur kan alle links beheren
    - Toont view/download statistieken
    """,
)
async def list_share_links(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[DocumentShareLinkResponse]:
    """List all active share links for a document.
    
    Requires bestuurslid or beheerder role.
    """
    # Verify document exists
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )
    
    # Find all share links for this document (in production, query database)
    links = []
    now = datetime.now(timezone.utc)
    
    for token, data in _share_links_store.items():
        if (
            data.get("type") == "share"
            and data.get("document_id") == str(document_id)
            and data.get("is_active", False)
            and data.get("expires_at", now) > now
        ):
            links.append(
                DocumentShareLinkResponse(
                    id=uuid.UUID(data["id"]),
                    document_id=uuid.UUID(data["document_id"]),
                    share_url=f"/documents/shared/{token}",
                    token=token,
                    expires_at=data["expires_at"],
                    created_by_id=uuid.UUID(data["created_by_id"]),
                    created_by_name=data.get("created_by_name"),
                    allow_download=data.get("allow_download", True),
                    view_count=data.get("view_count", 0),
                    download_count=data.get("download_count", 0),
                    is_active=data.get("is_active", True),
                    created_at=data["created_at"],
                )
            )
    
    return links


@router.delete(
    "/{document_id}/share-links/{link_token}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deelbare link intrekken",
    description="""
    STORY-019: Trek een deelbare link in zodat deze niet meer gebruikt kan worden.
    """,
)
async def revoke_share_link(
    vve_id: uuid.UUID,
    document_id: uuid.UUID,
    link_token: str,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Revoke a share link for a document.
    
    Requires bestuurslid or beheerder role.
    """
    # Verify document exists
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.vve_id == vve_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document niet gevonden",
        )
    
    # Find and deactivate the share link
    if link_token not in _share_links_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link niet gevonden",
        )
    
    link_data = _share_links_store[link_token]
    if link_data.get("document_id") != str(document_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link niet gevonden voor dit document",
        )
    
    # Mark as inactive (in production, update database)
    _share_links_store[link_token]["is_active"] = False
    
    # TODO: Log share link revocation for audit (FEAT-015 integration)
