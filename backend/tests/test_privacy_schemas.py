"""Tests for Privacy Statement schemas - STORY-080 validation logic."""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.privacy import (
    PrivacyStatementCreate,
    PrivacyStatementUpdate,
    PrivacyStatementResponse,
    PrivacyStatementListResponse,
    PrivacyStatementTemplate,
    PrivacyStatementStatus,
)


class TestPrivacyStatementCreateValidation:
    """Tests for STORY-080: Privacy statement genereren - schema validation."""

    def test_privacy_statement_create_minimal(self):
        """Test that privacy statement creation is valid with minimal fields."""
        statement = PrivacyStatementCreate()
        
        assert statement.title == "Privacy Statement"
        assert statement.version == "1.0"
        assert statement.vve_name is None
        assert statement.contact_email is None

    def test_privacy_statement_create_with_custom_title(self):
        """Test privacy statement with custom title."""
        statement = PrivacyStatementCreate(
            title="Privacyverklaring VVE De Zonnewijzer",
            version="2.0",
        )
        
        assert statement.title == "Privacyverklaring VVE De Zonnewijzer"
        assert statement.version == "2.0"

    def test_privacy_statement_create_with_vve_info(self):
        """Test privacy statement with VVE information."""
        statement = PrivacyStatementCreate(
            vve_name="VVE Parkzicht",
            vve_address="Parkweg 1-100, 1234 AB Amsterdam",
            contact_email="bestuur@vveparkzicht.nl",
            contact_phone="020-1234567",
        )
        
        assert statement.vve_name == "VVE Parkzicht"
        assert statement.vve_address == "Parkweg 1-100, 1234 AB Amsterdam"
        assert statement.contact_email == "bestuur@vveparkzicht.nl"
        assert statement.contact_phone == "020-1234567"

    def test_privacy_statement_create_with_dpo_info(self):
        """Test privacy statement with Data Protection Officer info."""
        statement = PrivacyStatementCreate(
            dpo_name="Jan Pietersen",
            dpo_email="dpo@vve.nl",
        )
        
        assert statement.dpo_name == "Jan Pietersen"
        assert statement.dpo_email == "dpo@vve.nl"

    def test_privacy_statement_create_with_content(self):
        """Test privacy statement with custom content sections."""
        statement = PrivacyStatementCreate(
            introduction="Welkom bij onze VVE.",
            data_collected="Wij verzamelen naam en adres.",
            rights="U heeft recht op inzage.",
        )
        
        assert statement.introduction == "Welkom bij onze VVE."
        assert statement.data_collected == "Wij verzamelen naam en adres."
        assert statement.rights == "U heeft recht op inzage."

    def test_privacy_statement_title_too_short(self):
        """Test that title must be at least 3 characters."""
        with pytest.raises(ValueError) as exc_info:
            PrivacyStatementCreate(title="Hi")
        
        assert "3" in str(exc_info.value) or "min_length" in str(exc_info.value).lower()

    def test_privacy_statement_invalid_email(self):
        """Test that contact_email must be valid."""
        with pytest.raises(ValueError) as exc_info:
            PrivacyStatementCreate(contact_email="invalid-email")
        
        assert "email" in str(exc_info.value).lower() or "value_error" in str(exc_info.value).lower()


class TestPrivacyStatementUpdateValidation:
    """Tests for PrivacyStatementUpdate schema."""

    def test_privacy_statement_update_partial(self):
        """Test that privacy statement update accepts partial updates."""
        update = PrivacyStatementUpdate(title="Nieuwe titel")
        
        assert update.title == "Nieuwe titel"
        assert update.version is None
        assert update.status is None

    def test_privacy_statement_update_status_change(self):
        """Test updating privacy statement status."""
        update = PrivacyStatementUpdate(status=PrivacyStatementStatus.PUBLISHED)
        
        assert update.status == PrivacyStatementStatus.PUBLISHED


class TestPrivacyStatementResponse:
    """Tests for PrivacyStatementResponse schema."""

    def test_privacy_statement_response_creation(self):
        """Test creating a privacy statement response."""
        statement_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = PrivacyStatementResponse(
            id=statement_id,
            vve_id=vve_id,
            title="Privacy Statement",
            version="1.0",
            vve_name="VVE Test",
            vve_address=None,
            contact_email=None,
            contact_phone=None,
            dpo_name=None,
            dpo_email=None,
            introduction="Test intro",
            data_collected="Test data",
            data_purpose="Test purpose",
            legal_basis=None,
            data_sharing=None,
            retention_period=None,
            rights=None,
            cookies=None,
            security=None,
            complaints=None,
            changes=None,
            status=PrivacyStatementStatus.DRAFT,
            published_at=None,
            created_by_id=uuid.uuid4(),
            created_by_name="Jan Jansen",
            created_at=now,
            updated_at=now,
        )
        
        assert response.id == statement_id
        assert response.title == "Privacy Statement"
        assert response.status == PrivacyStatementStatus.DRAFT
        assert response.published_at is None

    def test_privacy_statement_response_published(self):
        """Test privacy statement response with published status."""
        now = datetime.now(timezone.utc)
        
        response = PrivacyStatementResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Privacy Statement",
            version="1.0",
            vve_name="VVE Test",
            vve_address=None,
            contact_email=None,
            contact_phone=None,
            dpo_name=None,
            dpo_email=None,
            introduction=None,
            data_collected=None,
            data_purpose=None,
            legal_basis=None,
            data_sharing=None,
            retention_period=None,
            rights=None,
            cookies=None,
            security=None,
            complaints=None,
            changes=None,
            status=PrivacyStatementStatus.PUBLISHED,
            published_at=now,
            created_by_id=None,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == PrivacyStatementStatus.PUBLISHED
        assert response.published_at == now


class TestPrivacyStatementListResponse:
    """Tests for PrivacyStatementListResponse schema."""

    def test_privacy_statement_list_response_creation(self):
        """Test creating a privacy statement list response."""
        statement_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = PrivacyStatementListResponse(
            id=statement_id,
            vve_id=vve_id,
            title="Privacy Statement",
            version="1.0",
            status=PrivacyStatementStatus.DRAFT,
            published_at=None,
            created_at=now,
        )
        
        assert response.id == statement_id
        assert response.title == "Privacy Statement"
        assert response.version == "1.0"
        assert response.status == PrivacyStatementStatus.DRAFT


class TestPrivacyStatementTemplate:
    """Tests for PrivacyStatementTemplate schema."""

    def test_template_has_all_sections(self):
        """Test that template contains all required sections."""
        template = PrivacyStatementTemplate()
        
        assert template.introduction is not None
        assert len(template.introduction) > 50
        
        assert template.data_collected is not None
        assert "persoonsgegevens" in template.data_collected.lower()
        
        assert template.data_purpose is not None
        assert "doelen" in template.data_purpose.lower() or "doel" in template.data_purpose.lower()
        
        assert template.legal_basis is not None
        assert "verwerking" in template.legal_basis.lower() or "wettelijke" in template.legal_basis.lower()
        
        assert template.data_sharing is not None
        assert template.retention_period is not None
        assert template.rights is not None
        assert template.cookies is not None
        assert template.security is not None
        assert template.complaints is not None
        assert template.changes is not None

    def test_template_contains_legal_references(self):
        """Test that template contains proper legal references."""
        template = PrivacyStatementTemplate()
        
        # Check for AVG reference
        assert "AVG" in template.introduction or "Algemene Verordening" in template.introduction
        
        # Check for rights reference
        assert "inzage" in template.rights.lower()
        
        # Check for complaints authority
        assert "Autoriteit Persoonsgegevens" in template.complaints


class TestPrivacyStatementStatus:
    """Tests for PrivacyStatementStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert PrivacyStatementStatus.DRAFT == "draft"
        assert PrivacyStatementStatus.PUBLISHED == "published"
        assert PrivacyStatementStatus.ARCHIVED == "archived"
