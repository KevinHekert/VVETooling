"""Document API routes.

Implements FEAT-011 (Documentbeheer) and STORY-004 (Bestuur uploadt document).
Implements STORY-018: Document versiebeheer en rol-specifiek delen.
Storage limits per D-004.
"""

import uuid
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
    DocumentResponse,
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
    root_id = current_doc.parent_document_id or current_doc.id
    new_version = current_doc.version + 1

    # Mark current version as not current
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
