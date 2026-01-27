"""Pydantic schemas for Documents.

Based on FEAT-011 (Documentbeheer) and STORY-004 (Bestuur uploadt document).
Implements STORY-018: Document versiebeheer en rol-specifiek delen.
Storage limits per D-004.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# Allowed file types per D-004
ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

# Maximum file size: 50MB
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

# Default roles for document visibility (STORY-018)
DEFAULT_VISIBLE_ROLES = "bewoner,penningmeester,bestuurslid,beheerder"


class DocumentCategory(str):
    """Document categories for organization."""

    GENERAL = "general"
    NOTULEN = "notulen"  # Meeting minutes
    JAARVERSLAG = "jaarverslag"  # Annual report
    BEGROTING = "begroting"  # Budget
    CONTRACT = "contract"
    VERZEKERING = "verzekering"  # Insurance
    ONDERHOUD = "onderhoud"  # Maintenance
    OVERIG = "overig"  # Other


class DocumentBase(BaseModel):
    """Base document schema."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    category: str = Field(default="general", max_length=50)
    is_public: bool = Field(
        default=False, description="Visible to all VVE members when true"
    )
    visible_to_roles: str = Field(
        default=DEFAULT_VISIBLE_ROLES,
        description="Comma-separated list of roles that can view this document",
    )


class DocumentCreate(DocumentBase):
    """Schema for document metadata when uploading."""

    pass


class DocumentUpdate(BaseModel):
    """Schema for updating document metadata."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    category: str | None = Field(None, max_length=50)
    is_public: bool | None = None
    visible_to_roles: str | None = Field(
        None, description="Comma-separated list of roles that can view this document"
    )


class DocumentResponse(DocumentBase):
    """Schema for document response."""

    id: uuid.UUID
    vve_id: uuid.UUID
    file_name: str
    file_type: str
    file_size_bytes: int
    uploaded_by_id: uuid.UUID | None = None
    uploaded_by_name: str | None = None
    created_at: datetime
    # Version fields (STORY-018)
    version: int = 1
    parent_document_id: uuid.UUID | None = None
    is_current_version: bool = True

    model_config = ConfigDict(from_attributes=True)


class DocumentVersionResponse(BaseModel):
    """Response for document version info (STORY-018)."""

    id: uuid.UUID
    version: int
    file_name: str
    file_size_bytes: int
    uploaded_by_name: str | None = None
    created_at: datetime
    is_current_version: bool

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(DocumentResponse):
    """Response after successful document upload (STORY-004)."""

    upload_success: bool = True
    message: str = "Document succesvol geüpload"


class DocumentDownloadResponse(BaseModel):
    """Response for document download request (FEAT-012)."""

    download_url: str
    expires_in_seconds: int = 3600  # 1 hour default
    file_name: str
    file_type: str


class StorageUsageResponse(BaseModel):
    """Response for VVE storage usage (D-004 limits)."""

    vve_id: uuid.UUID
    total_documents: int
    total_size_bytes: int
    total_size_mb: float
    storage_limit_mb: float  # Based on subscription tier (2/5/10 GB)
    usage_percentage: float
    is_near_limit: bool  # True when >80% used
