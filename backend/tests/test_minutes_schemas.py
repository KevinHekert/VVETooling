"""Tests for Meeting Minutes schemas - STORY-075 validation logic."""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.meeting import (
    MinutesCreate,
    MinutesUpdate,
    MinutesResponse,
    MinutesStatus,
    MinutesTemplate,
    DecisionCreate,
    DecisionResponse,
    DecisionType,
    DecisionUpdate,
)


class TestMinutesCreate:
    """Tests for MinutesCreate schema (STORY-075)."""

    def test_create_with_content(self):
        """Test creating minutes with content."""
        minutes = MinutesCreate(content="<h1>Notulen</h1><p>Test content</p>")
        
        assert minutes.content == "<h1>Notulen</h1><p>Test content</p>"

    def test_create_without_content(self):
        """Test creating minutes without content (empty draft)."""
        minutes = MinutesCreate()
        
        assert minutes.content is None


class TestMinutesUpdate:
    """Tests for MinutesUpdate schema (STORY-075)."""

    def test_update_content(self):
        """Test updating minutes content."""
        update = MinutesUpdate(content="<p>Updated content</p>")
        
        assert update.content == "<p>Updated content</p>"
        assert update.status is None

    def test_update_status_to_published(self):
        """Test updating status to published."""
        update = MinutesUpdate(status=MinutesStatus.PUBLISHED)
        
        assert update.status == MinutesStatus.PUBLISHED

    def test_update_status_to_approved(self):
        """Test updating status to approved."""
        update = MinutesUpdate(status=MinutesStatus.APPROVED)
        
        assert update.status == MinutesStatus.APPROVED


class TestMinutesResponse:
    """Tests for MinutesResponse schema (STORY-075)."""

    def test_draft_minutes_response(self):
        """Test creating a draft minutes response."""
        now = datetime.now(timezone.utc)
        
        response = MinutesResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            content="<h1>Notulen</h1>",
            status=MinutesStatus.DRAFT,
            created_by_id=uuid.uuid4(),
            created_by_name="Jan Jansen",
            last_saved_at=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == MinutesStatus.DRAFT
        assert response.created_by_name == "Jan Jansen"
        assert response.published_at is None
        assert response.approved_at is None

    def test_published_minutes_response(self):
        """Test creating a published minutes response."""
        now = datetime.now(timezone.utc)
        
        response = MinutesResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            content="<h1>Notulen</h1>",
            status=MinutesStatus.PUBLISHED,
            published_at=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == MinutesStatus.PUBLISHED
        assert response.published_at == now

    def test_approved_minutes_response(self):
        """Test creating an approved minutes response."""
        now = datetime.now(timezone.utc)
        
        response = MinutesResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            content="<h1>Notulen</h1>",
            status=MinutesStatus.APPROVED,
            approved_at=now,
            approved_by_id=uuid.uuid4(),
            approved_by_name="Piet Pietersen",
            created_at=now,
            updated_at=now,
        )
        
        assert response.status == MinutesStatus.APPROVED
        assert response.approved_by_name == "Piet Pietersen"


class TestMinutesTemplate:
    """Tests for MinutesTemplate schema (STORY-075)."""

    def test_template_creation(self):
        """Test creating a pre-populated template."""
        now = datetime.now(timezone.utc)
        
        template = MinutesTemplate(
            meeting_id=uuid.uuid4(),
            meeting_title="Jaarlijkse ALV 2026",
            meeting_date=now,
            attendees=["Jan Jansen", "Piet Pietersen", "Kees de Groot"],
            agenda_items=["Opening", "Jaarverslag", "Begroting", "Sluiting"],
            html_template="<h1>Notulen: Jaarlijkse ALV 2026</h1>",
        )
        
        assert template.meeting_title == "Jaarlijkse ALV 2026"
        assert len(template.attendees) == 3
        assert len(template.agenda_items) == 4
        assert "Notulen" in template.html_template


class TestDecisionCreate:
    """Tests for DecisionCreate schema (STORY-075)."""

    def test_create_besluit(self):
        """Test creating a besluit (decision)."""
        decision = DecisionCreate(
            decision_type=DecisionType.BESLUIT,
            title="Begroting 2027 goedgekeurd",
            description="De begroting voor 2027 is unaniem goedgekeurd.",
        )
        
        assert decision.decision_type == DecisionType.BESLUIT
        assert decision.title == "Begroting 2027 goedgekeurd"

    def test_create_actiepunt(self):
        """Test creating an actiepunt (action item)."""
        assignee_id = uuid.uuid4()
        due_date = datetime.now(timezone.utc)
        
        decision = DecisionCreate(
            decision_type=DecisionType.ACTIEPUNT,
            title="Offertes ophalen voor schilderwerk",
            assignee_id=assignee_id,
            due_date=due_date,
        )
        
        assert decision.decision_type == DecisionType.ACTIEPUNT
        assert decision.assignee_id == assignee_id
        assert decision.due_date == due_date

    def test_create_aandachtspunt(self):
        """Test creating an aandachtspunt (point of attention)."""
        decision = DecisionCreate(
            decision_type=DecisionType.AANDACHTSPUNT,
            title="Parkeerproblematiek besproken",
            description="Wordt volgend jaar opnieuw geagendeerd.",
        )
        
        assert decision.decision_type == DecisionType.AANDACHTSPUNT

    def test_title_min_length(self):
        """Test that title respects minimum length."""
        with pytest.raises(ValueError):
            DecisionCreate(
                decision_type=DecisionType.BESLUIT,
                title="X",  # Too short (< 2)
            )

    def test_title_max_length(self):
        """Test that title respects maximum length."""
        with pytest.raises(ValueError):
            DecisionCreate(
                decision_type=DecisionType.BESLUIT,
                title="x" * 256,  # Too long (> 255)
            )


class TestDecisionUpdate:
    """Tests for DecisionUpdate schema (STORY-075)."""

    def test_update_title(self):
        """Test updating decision title."""
        update = DecisionUpdate(title="Updated title")
        
        assert update.title == "Updated title"

    def test_mark_completed(self):
        """Test marking decision as completed."""
        update = DecisionUpdate(is_completed=True)
        
        assert update.is_completed is True

    def test_update_assignee(self):
        """Test updating decision assignee."""
        assignee_id = uuid.uuid4()
        update = DecisionUpdate(assignee_id=assignee_id)
        
        assert update.assignee_id == assignee_id


class TestDecisionResponse:
    """Tests for DecisionResponse schema (STORY-075)."""

    def test_besluit_response(self):
        """Test creating a besluit response."""
        now = datetime.now(timezone.utc)
        
        response = DecisionResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            decision_type=DecisionType.BESLUIT,
            title="Begroting goedgekeurd",
            is_completed=False,
            created_at=now,
            updated_at=now,
        )
        
        assert response.decision_type == DecisionType.BESLUIT
        assert response.is_completed is False

    def test_completed_actiepunt_response(self):
        """Test creating a completed action item response."""
        now = datetime.now(timezone.utc)
        
        response = DecisionResponse(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            decision_type=DecisionType.ACTIEPUNT,
            title="Offertes ophalen",
            assignee_name="Kees de Groot",
            is_completed=True,
            completed_at=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.is_completed is True
        assert response.completed_at is not None
        assert response.assignee_name == "Kees de Groot"


class TestMinutesStatus:
    """Tests for MinutesStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert MinutesStatus.DRAFT == "draft"
        assert MinutesStatus.PUBLISHED == "published"
        assert MinutesStatus.APPROVED == "approved"


class TestDecisionType:
    """Tests for DecisionType enum."""

    def test_all_types_defined(self):
        """Test that all required types are defined."""
        assert DecisionType.BESLUIT == "besluit"
        assert DecisionType.ACTIEPUNT == "actiepunt"
        assert DecisionType.AANDACHTSPUNT == "aandachtspunt"
