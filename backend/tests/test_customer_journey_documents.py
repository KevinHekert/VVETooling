"""Tests for Customer Journey: Document Management.

Based on customer journeys:
- 3.4 Voorzitter: Financieel Overzicht Checken - Documenten raadplegen
- 3.5 Voorzitter: Vergadering Voorbereiden - Documenten verzamelen
- 3.7 Bewoner: ALV Voorbereiding - Stukken bekijken
- 4.4 Eigenaarswisseling - Documenten leveren

STORY-004: Als bestuurslid wil ik een document uploaden,
zodat bewoners de nieuwste stukken kunnen bekijken.

STORY-018: Document versiebeheer en rol-specifiek delen.
STORY-019: Document download-links en notificaties.
"""

import uuid
from datetime import datetime, timezone, timedelta

import pytest

from app.schemas.document import (
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE_BYTES,
    DEFAULT_VISIBLE_ROLES,
    DocumentResponse,
    DocumentUploadResponse,
    DocumentUpdate,
    DocumentVersionResponse,
    StorageUsageResponse,
    DocumentDownloadResponse,
    DocumentShareLinkRequest,
    DocumentShareLinkResponse,
)


class TestDocumentUploadJourney:
    """Tests for Document Upload (STORY-004).
    
    Customer journey 3.5: Voorzitter uploadt documenten voor vergadering
    - Jaarrekening
    - Begroting
    - Notulen
    """

    def test_document_upload_response_complete(self):
        """Test complete document upload response."""
        now = datetime.now(timezone.utc)
        
        response = DocumentUploadResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Jaarrekening 2025",
            description="Goedgekeurde jaarrekening VVE Zonnelaan",
            file_name="jaarrekening_2025.pdf",
            file_type="application/pdf",
            file_size_bytes=1024000,
            category="jaarrekening",
            is_public=True,
            visible_to_roles=DEFAULT_VISIBLE_ROLES,
            created_at=now,
            version=1,
            is_current_version=True,
        )
        
        assert response.title == "Jaarrekening 2025"
        assert response.file_type == "application/pdf"
        assert response.is_public is True

    def test_document_upload_notulen(self):
        """Test uploading meeting minutes."""
        now = datetime.now(timezone.utc)
        
        response = DocumentUploadResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Notulen ALV 15 januari 2026",
            file_name="notulen_alv_2026_01.pdf",
            file_type="application/pdf",
            file_size_bytes=512000,
            category="notulen",
            is_public=True,
            visible_to_roles=DEFAULT_VISIBLE_ROLES,
            created_at=now,
        )
        
        assert response.category == "notulen"

    def test_document_upload_begroting(self):
        """Test uploading budget document."""
        now = datetime.now(timezone.utc)
        
        response = DocumentUploadResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Begroting 2026",
            file_name="begroting_2026.pdf",
            file_type="application/pdf",
            file_size_bytes=256000,
            category="begroting",
            is_public=True,
            visible_to_roles=DEFAULT_VISIBLE_ROLES,
            created_at=now,
        )
        
        assert response.category == "begroting"


class TestDocumentTypesJourney:
    """Tests for allowed document types."""

    def test_pdf_allowed(self):
        """Test PDF is allowed."""
        assert "application/pdf" in ALLOWED_FILE_TYPES

    def test_images_allowed(self):
        """Test images are allowed."""
        assert "image/jpeg" in ALLOWED_FILE_TYPES
        assert "image/png" in ALLOWED_FILE_TYPES
        assert "image/webp" in ALLOWED_FILE_TYPES

    def test_office_docs_allowed(self):
        """Test Office documents are allowed."""
        # Word documents
        assert "application/msword" in ALLOWED_FILE_TYPES
        assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in ALLOWED_FILE_TYPES
        
        # Excel documents
        assert "application/vnd.ms-excel" in ALLOWED_FILE_TYPES
        assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in ALLOWED_FILE_TYPES

    def test_max_file_size(self):
        """Test maximum file size is defined (50MB)."""
        assert MAX_FILE_SIZE_BYTES == 50 * 1024 * 1024


class TestDocumentVisibilityJourney:
    """Tests for document visibility (STORY-018 rol-specifiek delen)."""

    def test_default_visible_to_all_roles(self):
        """Test default visibility includes all roles."""
        assert "bewoner" in DEFAULT_VISIBLE_ROLES
        assert "penningmeester" in DEFAULT_VISIBLE_ROLES
        assert "bestuurslid" in DEFAULT_VISIBLE_ROLES
        assert "beheerder" in DEFAULT_VISIBLE_ROLES

    def test_document_restricted_to_bestuur(self):
        """Test document visible only to board members."""
        now = datetime.now(timezone.utc)
        
        response = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Vertrouwelijk - Offerte schilderwerk",
            file_name="offerte_schilder.pdf",
            file_type="application/pdf",
            file_size_bytes=128000,
            is_public=False,
            visible_to_roles="bestuurslid,beheerder",
            created_at=now,
        )
        
        assert "bewoner" not in response.visible_to_roles
        assert "bestuurslid" in response.visible_to_roles

    def test_document_update_visibility(self):
        """Test updating document visibility."""
        update = DocumentUpdate(
            visible_to_roles="penningmeester,bestuurslid,beheerder",
        )
        
        assert update.visible_to_roles == "penningmeester,bestuurslid,beheerder"
        assert "bewoner" not in update.visible_to_roles


class TestDocumentVersionJourney:
    """Tests for Document Versioning (STORY-018).
    
    Customer journey: Updating documents while keeping history
    """

    def test_document_response_version_fields(self):
        """Test document response includes version fields."""
        now = datetime.now(timezone.utc)
        
        response = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Huishoudelijk Reglement",
            file_name="huishoudelijk_reglement_v3.pdf",
            file_type="application/pdf",
            file_size_bytes=200000,
            created_at=now,
            version=3,
            parent_document_id=uuid.uuid4(),
            is_current_version=True,
        )
        
        assert response.version == 3
        assert response.parent_document_id is not None
        assert response.is_current_version is True

    def test_document_version_response(self):
        """Test document version list response."""
        now = datetime.now(timezone.utc)
        
        version = DocumentVersionResponse(
            id=uuid.uuid4(),
            version=2,
            file_name="document_v2.pdf",
            file_size_bytes=150000,
            uploaded_by_name="Jan Jansen",
            created_at=now,
            is_current_version=False,
        )
        
        assert version.version == 2
        assert version.uploaded_by_name == "Jan Jansen"
        assert version.is_current_version is False

    def test_document_default_version(self):
        """Test new document starts at version 1."""
        now = datetime.now(timezone.utc)
        
        response = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="New Document",
            file_name="new.pdf",
            file_type="application/pdf",
            file_size_bytes=100000,
            created_at=now,
        )
        
        assert response.version == 1
        assert response.is_current_version is True


class TestDocumentDownloadJourney:
    """Tests for Document Download (STORY-019).
    
    Customer journey:
    - 3.4 Voorzitter: Documenten raadplegen
    - 3.7 Bewoner: Downloadt jaarrekening
    """

    def test_download_response(self):
        """Test document download response."""
        response = DocumentDownloadResponse(
            download_url="/api/v1/documents/download/abc123token",
            expires_in_seconds=3600,
            file_name="jaarrekening_2025.pdf",
            file_type="application/pdf",
        )
        
        assert "download" in response.download_url
        assert response.expires_in_seconds == 3600
        assert response.file_name == "jaarrekening_2025.pdf"


class TestDocumentShareLinkJourney:
    """Tests for Document Share Links (STORY-019).
    
    Customer journey: Sharing documents with external parties
    """

    def test_share_link_request(self):
        """Test share link request."""
        request = DocumentShareLinkRequest(
            expires_in_hours=168,  # 1 week
            allow_download=True,
        )
        
        assert request.expires_in_hours == 168
        assert request.allow_download is True

    def test_share_link_request_view_only(self):
        """Test share link request for view only."""
        request = DocumentShareLinkRequest(
            expires_in_hours=24,
            allow_download=False,
        )
        
        assert request.allow_download is False

    def test_share_link_response(self):
        """Test share link response."""
        now = datetime.now(timezone.utc)
        
        response = DocumentShareLinkResponse(
            id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            share_url="/documents/shared/xyz789token",
            token="xyz789token",
            expires_at=now + timedelta(hours=24),
            created_by_id=uuid.uuid4(),
            created_by_name="Maria Voorzitter",
            allow_download=True,
            view_count=0,
            download_count=0,
            is_active=True,
            created_at=now,
        )
        
        assert response.is_active is True
        assert response.view_count == 0
        assert response.download_count == 0


class TestStorageUsageJourney:
    """Tests for Storage Usage monitoring."""

    def test_storage_usage_response(self):
        """Test storage usage response."""
        response = StorageUsageResponse(
            vve_id=uuid.uuid4(),
            total_documents=45,
            total_size_bytes=1500000000,  # 1.5 GB
            total_size_mb=1430.51,
            storage_limit_mb=5120.0,  # 5 GB
            usage_percentage=27.9,
            is_near_limit=False,
        )
        
        assert response.total_documents == 45
        assert response.is_near_limit is False
        assert response.usage_percentage < 80

    def test_storage_near_limit(self):
        """Test storage near limit warning."""
        response = StorageUsageResponse(
            vve_id=uuid.uuid4(),
            total_documents=150,
            total_size_bytes=4300000000,  # 4.3 GB
            total_size_mb=4100.00,
            storage_limit_mb=5120.0,
            usage_percentage=80.1,
            is_near_limit=True,
        )
        
        assert response.is_near_limit is True
        assert response.usage_percentage >= 80


class TestDocumentUpdateJourney:
    """Tests for Document Update."""

    def test_document_update_title(self):
        """Test updating document title."""
        update = DocumentUpdate(
            title="Updated Title - Jaarrekening 2025 (Definitief)",
        )
        
        assert update.title == "Updated Title - Jaarrekening 2025 (Definitief)"
        assert update.description is None

    def test_document_update_description(self):
        """Test updating document description."""
        update = DocumentUpdate(
            description="Goedgekeurd tijdens ALV 15 januari 2026",
        )
        
        assert update.description == "Goedgekeurd tijdens ALV 15 januari 2026"

    def test_document_update_category(self):
        """Test updating document category."""
        update = DocumentUpdate(
            category="jaarrekening_goedgekeurd",
        )
        
        assert update.category == "jaarrekening_goedgekeurd"

    def test_document_update_public_flag(self):
        """Test making document public."""
        update = DocumentUpdate(
            is_public=True,
        )
        
        assert update.is_public is True

    def test_document_update_multiple_fields(self):
        """Test updating multiple fields."""
        update = DocumentUpdate(
            title="Notulen ALV 2026",
            description="Vastgesteld",
            is_public=True,
            category="notulen",
        )
        
        assert update.title == "Notulen ALV 2026"
        assert update.is_public is True
