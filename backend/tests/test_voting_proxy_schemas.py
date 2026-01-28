"""Tests for Voting Proxy schemas - STORY-117 validation logic."""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.voting import (
    VotingProxyCreate,
    VotingProxyResponse,
    VotingProxyListResponse,
    VotingProxyConfirmation,
    VotingProxyStatus,
)


class TestVotingProxyCreateValidation:
    """Tests for STORY-117: Digitale volmacht registreren - schema validation."""

    def test_voting_proxy_create_valid(self):
        """Test that voting proxy creation is valid with required fields."""
        grantee_id = uuid.uuid4()
        unit_id = uuid.uuid4()
        
        proxy = VotingProxyCreate(
            grantee_id=grantee_id,
            unit_id=unit_id,
        )
        
        assert proxy.grantee_id == grantee_id
        assert proxy.unit_id == unit_id
        assert proxy.voting_id is None
        assert proxy.notes is None

    def test_voting_proxy_create_with_voting_id(self):
        """Test proxy creation for specific voting."""
        grantee_id = uuid.uuid4()
        unit_id = uuid.uuid4()
        voting_id = uuid.uuid4()
        
        proxy = VotingProxyCreate(
            grantee_id=grantee_id,
            unit_id=unit_id,
            voting_id=voting_id,
        )
        
        assert proxy.voting_id == voting_id

    def test_voting_proxy_create_with_notes(self):
        """Test proxy creation with optional notes."""
        grantee_id = uuid.uuid4()
        unit_id = uuid.uuid4()
        
        proxy = VotingProxyCreate(
            grantee_id=grantee_id,
            unit_id=unit_id,
            notes="Stem alsjeblieft voor het voorstel",
        )
        
        assert proxy.notes == "Stem alsjeblieft voor het voorstel"

    def test_notes_max_length_respected(self):
        """Test that notes respect max length of 1000 characters."""
        grantee_id = uuid.uuid4()
        unit_id = uuid.uuid4()
        long_notes = "x" * 1001
        
        with pytest.raises(ValueError) as exc_info:
            VotingProxyCreate(
                grantee_id=grantee_id,
                unit_id=unit_id,
                notes=long_notes,
            )
        
        assert "1000" in str(exc_info.value) or "string_too_long" in str(exc_info.value).lower()


class TestVotingProxyResponse:
    """Tests for VotingProxyResponse schema."""

    def test_voting_proxy_response_creation(self):
        """Test creating a voting proxy response."""
        proxy_id = uuid.uuid4()
        grantor_id = uuid.uuid4()
        grantee_id = uuid.uuid4()
        unit_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = VotingProxyResponse(
            id=proxy_id,
            grantor_id=grantor_id,
            grantor_name="Jan Jansen",
            grantee_id=grantee_id,
            grantee_name="Piet Pietersen",
            unit_id=unit_id,
            unit_number="A1",
            voting_id=None,
            voting_title=None,
            vve_id=vve_id,
            status=VotingProxyStatus.PENDING,
            notes=None,
            confirmed_at=None,
            revoked_at=None,
            created_at=now,
            updated_at=now,
        )
        
        assert response.id == proxy_id
        assert response.grantor_name == "Jan Jansen"
        assert response.grantee_name == "Piet Pietersen"
        assert response.unit_number == "A1"
        assert response.status == VotingProxyStatus.PENDING
        assert response.confirmed_at is None
        assert response.revoked_at is None

    def test_confirmed_proxy_has_timestamp(self):
        """Test that confirmed proxy has confirmation timestamp."""
        now = datetime.now(timezone.utc)
        
        response = VotingProxyResponse(
            id=uuid.uuid4(),
            grantor_id=uuid.uuid4(),
            grantor_name="Jan Jansen",
            grantee_id=uuid.uuid4(),
            grantee_name="Piet Pietersen",
            unit_id=uuid.uuid4(),
            unit_number="B2",
            voting_id=None,
            voting_title=None,
            vve_id=uuid.uuid4(),
            status=VotingProxyStatus.CONFIRMED,
            notes=None,
            confirmed_at=now,
            revoked_at=None,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == VotingProxyStatus.CONFIRMED
        assert response.confirmed_at == now

    def test_revoked_proxy_has_timestamp(self):
        """Test that revoked proxy has revocation timestamp."""
        now = datetime.now(timezone.utc)
        
        response = VotingProxyResponse(
            id=uuid.uuid4(),
            grantor_id=uuid.uuid4(),
            grantor_name="Jan Jansen",
            grantee_id=uuid.uuid4(),
            grantee_name="Piet Pietersen",
            unit_id=uuid.uuid4(),
            unit_number="C3",
            voting_id=None,
            voting_title=None,
            vve_id=uuid.uuid4(),
            status=VotingProxyStatus.REVOKED,
            notes=None,
            confirmed_at=None,
            revoked_at=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == VotingProxyStatus.REVOKED
        assert response.revoked_at == now


class TestVotingProxyListResponse:
    """Tests for VotingProxyListResponse schema."""

    def test_voting_proxy_list_response_creation(self):
        """Test creating a voting proxy list response."""
        proxy_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = VotingProxyListResponse(
            id=proxy_id,
            grantor_name="Jan Jansen",
            grantee_name="Piet Pietersen",
            unit_number="A1",
            voting_title=None,
            status=VotingProxyStatus.PENDING,
            created_at=now,
        )
        
        assert response.id == proxy_id
        assert response.grantor_name == "Jan Jansen"
        assert response.grantee_name == "Piet Pietersen"
        assert response.unit_number == "A1"
        assert response.voting_title is None
        assert response.status == VotingProxyStatus.PENDING

    def test_voting_proxy_list_with_voting_title(self):
        """Test list response with specific voting title."""
        now = datetime.now(timezone.utc)
        
        response = VotingProxyListResponse(
            id=uuid.uuid4(),
            grantor_name="Jan Jansen",
            grantee_name="Piet Pietersen",
            unit_number="B2",
            voting_title="Voorstel renovatie dak",
            status=VotingProxyStatus.CONFIRMED,
            created_at=now,
        )
        
        assert response.voting_title == "Voorstel renovatie dak"


class TestVotingProxyConfirmation:
    """Tests for VotingProxyConfirmation schema."""

    def test_confirmation_response_creation(self):
        """Test creating a confirmation response."""
        proxy_id = uuid.uuid4()
        
        confirmation = VotingProxyConfirmation(
            proxy_id=proxy_id,
            message="Volmacht succesvol bevestigd",
            status=VotingProxyStatus.CONFIRMED,
        )
        
        assert confirmation.proxy_id == proxy_id
        assert confirmation.message == "Volmacht succesvol bevestigd"
        assert confirmation.status == VotingProxyStatus.CONFIRMED

    def test_revocation_response(self):
        """Test creating a revocation response."""
        proxy_id = uuid.uuid4()
        
        confirmation = VotingProxyConfirmation(
            proxy_id=proxy_id,
            message="Volmacht succesvol ingetrokken",
            status=VotingProxyStatus.REVOKED,
        )
        
        assert confirmation.message == "Volmacht succesvol ingetrokken"
        assert confirmation.status == VotingProxyStatus.REVOKED


class TestVotingProxyStatus:
    """Tests for VotingProxyStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert VotingProxyStatus.PENDING == "pending"
        assert VotingProxyStatus.CONFIRMED == "confirmed"
        assert VotingProxyStatus.REVOKED == "revoked"
        assert VotingProxyStatus.USED == "used"
