"""Tests for Meeting Proxy schemas - STORY-073 validation logic."""

import uuid

import pytest

from app.schemas.meeting import (
    ProxyCreate,
    ProxyScope,
    ProxyStatus,
    ProxyResponse,
    ProxySummary,
    EligibleGrantee,
)


class TestProxyCreateValidation:
    """Tests for STORY-073: Volmacht digitaal afgeven - schema validation."""

    def test_full_proxy_valid(self):
        """Test that full proxy creation is valid without agenda items."""
        grantee_id = uuid.uuid4()
        proxy = ProxyCreate(
            grantee_id=grantee_id,
            scope=ProxyScope.FULL,
        )
        
        assert proxy.grantee_id == grantee_id
        assert proxy.scope == ProxyScope.FULL
        assert proxy.agenda_item_ids is None
        assert proxy.notes is None

    def test_full_proxy_with_notes(self):
        """Test full proxy with optional notes."""
        grantee_id = uuid.uuid4()
        proxy = ProxyCreate(
            grantee_id=grantee_id,
            scope=ProxyScope.FULL,
            notes="Stem alsjeblieft tegen agendapunt 5",
        )
        
        assert proxy.notes == "Stem alsjeblieft tegen agendapunt 5"

    def test_specific_proxy_requires_agenda_items(self):
        """Test that specific proxy scope requires agenda items."""
        grantee_id = uuid.uuid4()
        
        with pytest.raises(ValueError) as exc_info:
            ProxyCreate(
                grantee_id=grantee_id,
                scope=ProxyScope.SPECIFIC,
                agenda_item_ids=[],  # Empty list should fail
            )
        
        assert "Agendapunten zijn verplicht" in str(exc_info.value)

    def test_specific_proxy_with_agenda_items_valid(self):
        """Test that specific proxy with agenda items is valid."""
        grantee_id = uuid.uuid4()
        agenda_item_1 = uuid.uuid4()
        agenda_item_2 = uuid.uuid4()
        
        proxy = ProxyCreate(
            grantee_id=grantee_id,
            scope=ProxyScope.SPECIFIC,
            agenda_item_ids=[agenda_item_1, agenda_item_2],
        )
        
        assert proxy.scope == ProxyScope.SPECIFIC
        assert len(proxy.agenda_item_ids) == 2
        assert agenda_item_1 in proxy.agenda_item_ids
        assert agenda_item_2 in proxy.agenda_item_ids

    def test_notes_max_length_respected(self):
        """Test that notes respect max length of 500 characters."""
        grantee_id = uuid.uuid4()
        long_notes = "x" * 501
        
        with pytest.raises(ValueError) as exc_info:
            ProxyCreate(
                grantee_id=grantee_id,
                scope=ProxyScope.FULL,
                notes=long_notes,
            )
        
        assert "500" in str(exc_info.value) or "string_too_long" in str(exc_info.value).lower()


class TestProxyResponse:
    """Tests for ProxyResponse schema."""

    def test_proxy_response_creation(self):
        """Test creating a proxy response."""
        from datetime import datetime, timezone
        
        proxy_id = uuid.uuid4()
        meeting_id = uuid.uuid4()
        grantor_id = uuid.uuid4()
        grantee_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = ProxyResponse(
            id=proxy_id,
            meeting_id=meeting_id,
            grantor_id=grantor_id,
            grantor_name="Jan Jansen",
            grantee_id=grantee_id,
            grantee_name="Piet Pietersen",
            scope=ProxyScope.FULL,
            status=ProxyStatus.PENDING,
            created_at=now,
            updated_at=now,
        )
        
        assert response.id == proxy_id
        assert response.grantor_name == "Jan Jansen"
        assert response.grantee_name == "Piet Pietersen"
        assert response.status == ProxyStatus.PENDING
        assert response.confirmed_at is None
        assert response.revoked_at is None

    def test_confirmed_proxy_has_timestamp(self):
        """Test that confirmed proxy has confirmation timestamp."""
        from datetime import datetime, timezone
        
        now = datetime.now(timezone.utc)
        
        response = ProxyResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            grantor_id=uuid.uuid4(),
            grantee_id=uuid.uuid4(),
            scope=ProxyScope.FULL,
            status=ProxyStatus.CONFIRMED,
            confirmed_at=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == ProxyStatus.CONFIRMED
        assert response.confirmed_at == now


class TestProxySummary:
    """Tests for ProxySummary schema."""

    def test_proxy_summary_creation(self):
        """Test creating a proxy summary."""
        meeting_id = uuid.uuid4()
        
        summary = ProxySummary(
            meeting_id=meeting_id,
            total_proxies=10,
            pending_count=3,
            confirmed_count=5,
            revoked_count=2,
        )
        
        assert summary.meeting_id == meeting_id
        assert summary.total_proxies == 10
        assert summary.pending_count == 3
        assert summary.confirmed_count == 5
        assert summary.revoked_count == 2


class TestEligibleGrantee:
    """Tests for EligibleGrantee schema."""

    def test_eligible_grantee_creation(self):
        """Test creating an eligible grantee response."""
        grantee_id = uuid.uuid4()
        
        grantee = EligibleGrantee(
            id=grantee_id,
            first_name="Kees",
            last_name="de Groot",
            full_name="Kees de Groot",
            is_board_member=True,
        )
        
        assert grantee.id == grantee_id
        assert grantee.first_name == "Kees"
        assert grantee.last_name == "de Groot"
        assert grantee.full_name == "Kees de Groot"
        assert grantee.is_board_member is True

    def test_eligible_grantee_non_board_member(self):
        """Test creating a non-board member grantee."""
        grantee = EligibleGrantee(
            id=uuid.uuid4(),
            first_name="Anna",
            last_name="Smit",
            full_name="Anna Smit",
            is_board_member=False,
        )
        
        assert grantee.is_board_member is False


class TestProxyStatus:
    """Tests for ProxyStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert ProxyStatus.PENDING == "pending"
        assert ProxyStatus.CONFIRMED == "confirmed"
        assert ProxyStatus.REVOKED == "revoked"


class TestProxyScope:
    """Tests for ProxyScope enum."""

    def test_all_scopes_defined(self):
        """Test that all required scopes are defined."""
        assert ProxyScope.FULL == "full"
        assert ProxyScope.SPECIFIC == "specific"
