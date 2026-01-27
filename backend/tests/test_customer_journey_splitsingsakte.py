"""Tests for Customer Journey: Splitsingsakte Versiebeheer.

Based on FEAT-019 (Splitsingsakte versiebeheer) and STORY-041 (Splitsingsakte versies overzicht).
"""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.splitsingsakte import (
    SplitsingsakteVersionStatus,
    SplitsingsakteVersionBase,
    SplitsingsakteVersionCreate,
    SplitsingsakteVersionUpdate,
    SplitsingsakteVersionActivate,
    SplitsingsakteVersionResponse,
    SplitsingsakteVersionListResponse,
)


class TestSplitsingsakteVersionStatusJourney:
    """Tests for Splitsingsakte Version Status."""

    def test_status_draft(self):
        """Test draft status for new versions."""
        assert SplitsingsakteVersionStatus.DRAFT.value == "draft"

    def test_status_active(self):
        """Test active status for current version."""
        assert SplitsingsakteVersionStatus.ACTIVE.value == "active"

    def test_status_archived(self):
        """Test archived status for old versions."""
        assert SplitsingsakteVersionStatus.ARCHIVED.value == "archived"


class TestSplitsingsakteVersionCreateJourney:
    """Tests for creating Splitsingsakte versions."""

    def test_version_create_complete(self):
        """Test creating version with all fields."""
        now = datetime.now(timezone.utc)
        doc_id = uuid.uuid4()
        
        version = SplitsingsakteVersionCreate(
            name="Splitsingsakte 2020 - Wijziging parkeerplaatsen",
            description="Wijziging in de verdeling van parkeerplaatsen per 1 juli 2020",
            effective_date=now,
            document_id=doc_id,
        )
        
        assert version.name == "Splitsingsakte 2020 - Wijziging parkeerplaatsen"
        assert version.document_id == doc_id

    def test_version_create_minimal(self):
        """Test creating version with minimal fields."""
        version = SplitsingsakteVersionCreate(
            name="Originele Splitsingsakte 1985",
        )
        
        assert version.name == "Originele Splitsingsakte 1985"
        assert version.description is None
        assert version.effective_date is None

    def test_version_name_min_length(self):
        """Test version name minimum length (3 chars)."""
        with pytest.raises(ValueError):
            SplitsingsakteVersionCreate(name="AB")  # Too short

    def test_version_name_valid(self):
        """Test valid version name."""
        version = SplitsingsakteVersionCreate(name="ABC")
        assert version.name == "ABC"


class TestSplitsingsakteVersionUpdateJourney:
    """Tests for updating Splitsingsakte versions."""

    def test_version_update_name(self):
        """Test updating version name."""
        update = SplitsingsakteVersionUpdate(
            name="Herziene Splitsingsakte 2020",
        )
        
        assert update.name == "Herziene Splitsingsakte 2020"
        assert update.description is None

    def test_version_update_description(self):
        """Test updating version description."""
        update = SplitsingsakteVersionUpdate(
            description="Bevat wijzigingen t.o.v. versie 2015",
        )
        
        assert update.description == "Bevat wijzigingen t.o.v. versie 2015"

    def test_version_update_document(self):
        """Test linking to different document."""
        new_doc_id = uuid.uuid4()
        
        update = SplitsingsakteVersionUpdate(
            document_id=new_doc_id,
        )
        
        assert update.document_id == new_doc_id

    def test_version_update_effective_date(self):
        """Test updating effective date."""
        new_date = datetime(2026, 7, 1, tzinfo=timezone.utc)
        
        update = SplitsingsakteVersionUpdate(
            effective_date=new_date,
        )
        
        assert update.effective_date == new_date


class TestSplitsingsakteVersionActivateJourney:
    """Tests for activating Splitsingsakte versions."""

    def test_version_activate_schema(self):
        """Test activate schema (no fields needed)."""
        activate = SplitsingsakteVersionActivate()
        
        # Schema exists and is valid
        assert activate is not None


class TestSplitsingsakteVersionResponseJourney:
    """Tests for Splitsingsakte version response."""

    def test_version_response_complete(self):
        """Test complete version response."""
        now = datetime.now(timezone.utc)
        
        response = SplitsingsakteVersionResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            name="Splitsingsakte 2020",
            description="Gewijzigd per 1-7-2020",
            effective_date=now,
            document_id=uuid.uuid4(),
            version_number=3,
            status=SplitsingsakteVersionStatus.ACTIVE,
            created_by_id=uuid.uuid4(),
            created_by_name="Jan Beheerder",
            created_at=now,
            updated_at=now,
            activated_by_id=uuid.uuid4(),
            activated_by_name="Maria Voorzitter",
            activated_at=now,
            document_name="splitsingsakte_2020.pdf",
        )
        
        assert response.version_number == 3
        assert response.status == SplitsingsakteVersionStatus.ACTIVE
        assert response.activated_by_name == "Maria Voorzitter"

    def test_version_response_draft(self):
        """Test draft version response (not activated)."""
        now = datetime.now(timezone.utc)
        
        response = SplitsingsakteVersionResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            name="Concept Splitsingsakte 2026",
            version_number=4,
            status=SplitsingsakteVersionStatus.DRAFT,
            created_by_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == SplitsingsakteVersionStatus.DRAFT
        assert response.activated_at is None
        assert response.activated_by_id is None

    def test_version_response_archived(self):
        """Test archived version response."""
        now = datetime.now(timezone.utc)
        archived_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
        
        response = SplitsingsakteVersionResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            name="Originele Splitsingsakte 1985",
            version_number=1,
            status=SplitsingsakteVersionStatus.ARCHIVED,
            archived_date=archived_date,
            created_by_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == SplitsingsakteVersionStatus.ARCHIVED
        assert response.archived_date == archived_date


class TestSplitsingsakteVersionListResponseJourney:
    """Tests for Splitsingsakte version list response."""

    def test_version_list_response(self):
        """Test version list item response."""
        now = datetime.now(timezone.utc)
        
        list_item = SplitsingsakteVersionListResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            version_number=2,
            name="Splitsingsakte 2015",
            status=SplitsingsakteVersionStatus.ARCHIVED,
            effective_date=datetime(2015, 1, 1, tzinfo=timezone.utc),
            created_at=now,
            is_active=False,
        )
        
        assert list_item.version_number == 2
        assert list_item.is_active is False

    def test_version_list_response_active(self):
        """Test active version in list."""
        now = datetime.now(timezone.utc)
        
        list_item = SplitsingsakteVersionListResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            version_number=3,
            name="Huidige Splitsingsakte",
            status=SplitsingsakteVersionStatus.ACTIVE,
            effective_date=now,
            created_at=now,
            is_active=True,
        )
        
        assert list_item.is_active is True
        assert list_item.status == SplitsingsakteVersionStatus.ACTIVE
