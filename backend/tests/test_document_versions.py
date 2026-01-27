"""Tests for Document Versioning (STORY-018).

Tests document version management functionality:
- Version schema validation
- Version number tracking
- Role-based visibility
"""

import uuid
from datetime import datetime
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.document import (
    DocumentResponse,
    DocumentVersionResponse,
    DocumentUpdate,
    DEFAULT_VISIBLE_ROLES,
)


class TestDocumentVersionSchemas:
    """Test document versioning schemas (STORY-018)."""

    def test_document_response_includes_version_fields(self):
        """Verify DocumentResponse includes version fields."""
        doc = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Test Document",
            description="Test description",
            file_name="test.pdf",
            file_type="application/pdf",
            file_size_bytes=1024,
            category="general",
            is_public=False,
            visible_to_roles=DEFAULT_VISIBLE_ROLES,
            created_at=datetime.now(),
            version=1,
            parent_document_id=None,
            is_current_version=True,
        )
        
        assert doc.version == 1
        assert doc.parent_document_id is None
        assert doc.is_current_version is True

    def test_document_response_default_version(self):
        """Verify default version values."""
        doc = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Test Document",
            file_name="test.pdf",
            file_type="application/pdf",
            file_size_bytes=1024,
            created_at=datetime.now(),
        )
        
        assert doc.version == 1
        assert doc.is_current_version is True
        assert doc.visible_to_roles == DEFAULT_VISIBLE_ROLES

    def test_document_response_with_parent(self):
        """Verify document with parent (newer version)."""
        parent_id = uuid.uuid4()
        doc = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Test Document",
            file_name="test_v2.pdf",
            file_type="application/pdf",
            file_size_bytes=2048,
            created_at=datetime.now(),
            version=2,
            parent_document_id=parent_id,
            is_current_version=True,
        )
        
        assert doc.version == 2
        assert doc.parent_document_id == parent_id
        assert doc.is_current_version is True

    def test_document_version_response(self):
        """Verify DocumentVersionResponse schema."""
        version = DocumentVersionResponse(
            id=uuid.uuid4(),
            version=3,
            file_name="document_v3.pdf",
            file_size_bytes=4096,
            uploaded_by_name="Jan Jansen",
            created_at=datetime.now(),
            is_current_version=True,
        )
        
        assert version.version == 3
        assert version.file_name == "document_v3.pdf"
        assert version.uploaded_by_name == "Jan Jansen"
        assert version.is_current_version is True

    def test_document_version_response_without_uploader(self):
        """Verify DocumentVersionResponse without uploader name."""
        version = DocumentVersionResponse(
            id=uuid.uuid4(),
            version=1,
            file_name="document.pdf",
            file_size_bytes=1024,
            created_at=datetime.now(),
            is_current_version=False,
        )
        
        assert version.uploaded_by_name is None
        assert version.is_current_version is False


class TestDocumentVisibilityRoles:
    """Test role-based visibility (STORY-018)."""

    def test_default_visible_to_all_roles(self):
        """Verify default visibility includes all roles."""
        assert "bewoner" in DEFAULT_VISIBLE_ROLES
        assert "penningmeester" in DEFAULT_VISIBLE_ROLES
        assert "bestuurslid" in DEFAULT_VISIBLE_ROLES
        assert "beheerder" in DEFAULT_VISIBLE_ROLES

    def test_document_update_can_change_visibility(self):
        """Verify visibility can be updated."""
        update = DocumentUpdate(
            visible_to_roles="bestuurslid,beheerder"
        )
        
        assert update.visible_to_roles == "bestuurslid,beheerder"
        assert "bewoner" not in update.visible_to_roles

    def test_document_update_partial(self):
        """Verify partial update without visibility change."""
        update = DocumentUpdate(
            title="New Title"
        )
        
        assert update.title == "New Title"
        assert update.visible_to_roles is None

    def test_document_response_custom_visibility(self):
        """Verify custom visibility in response."""
        doc = DocumentResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Bestuur Only Document",
            file_name="secret.pdf",
            file_type="application/pdf",
            file_size_bytes=1024,
            created_at=datetime.now(),
            visible_to_roles="bestuurslid,beheerder",
            is_public=False,
        )
        
        assert doc.visible_to_roles == "bestuurslid,beheerder"
        assert "bewoner" not in doc.visible_to_roles
