"""Tests for Poll schemas - STORY-116 validation logic."""

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal

import pytest

from app.schemas.voting import (
    PollCreate,
    PollUpdate,
    PollResponse,
    PollListResponse,
    PollOptionResponse,
    PollVoteCreate,
    PollVoteResponse,
    PollStatus,
    PollResultsVisibility,
)


class TestPollCreateValidation:
    """Tests for STORY-116: Poll aanmaken voor draagvlakmeting - schema validation."""

    def test_poll_create_valid_minimal(self):
        """Test that poll creation is valid with minimal required fields."""
        end_date = datetime.now(timezone.utc) + timedelta(days=7)
        
        poll = PollCreate(
            title="Welke kleur voor de voordeur?",
            options=["Groen", "Blauw"],
            end_date=end_date,
        )
        
        assert poll.title == "Welke kleur voor de voordeur?"
        assert poll.options == ["Groen", "Blauw"]
        assert poll.description is None
        assert poll.allow_multiple is False
        assert poll.is_anonymous is False
        assert poll.results_visibility == PollResultsVisibility.ALL

    def test_poll_create_with_all_options(self):
        """Test poll creation with all options specified."""
        end_date = datetime.now(timezone.utc) + timedelta(days=14)
        
        poll = PollCreate(
            title="Welk onderhoud heeft prioriteit?",
            description="Kies welk onderhoud als eerste uitgevoerd moet worden.",
            options=["Dak renovatie", "Gevel schilderen", "CV ketel vervanging"],
            end_date=end_date,
            allow_multiple=True,
            is_anonymous=True,
            results_visibility=PollResultsVisibility.BOARD_ONLY,
        )
        
        assert poll.description == "Kies welk onderhoud als eerste uitgevoerd moet worden."
        assert len(poll.options) == 3
        assert poll.allow_multiple is True
        assert poll.is_anonymous is True
        assert poll.results_visibility == PollResultsVisibility.BOARD_ONLY

    def test_poll_title_too_short(self):
        """Test that poll title must be at least 3 characters."""
        end_date = datetime.now(timezone.utc) + timedelta(days=7)
        
        with pytest.raises(ValueError) as exc_info:
            PollCreate(
                title="Hi",
                options=["Ja", "Nee"],
                end_date=end_date,
            )
        
        assert "3" in str(exc_info.value) or "min_length" in str(exc_info.value).lower()

    def test_poll_requires_at_least_two_options(self):
        """Test that poll requires at least 2 options."""
        end_date = datetime.now(timezone.utc) + timedelta(days=7)
        
        with pytest.raises(ValueError) as exc_info:
            PollCreate(
                title="Eén optie poll",
                options=["Alleen dit"],
                end_date=end_date,
            )
        
        assert "2" in str(exc_info.value) or "min_length" in str(exc_info.value).lower()

    def test_poll_max_ten_options(self):
        """Test that poll has a maximum of 10 options."""
        end_date = datetime.now(timezone.utc) + timedelta(days=7)
        
        with pytest.raises(ValueError) as exc_info:
            PollCreate(
                title="Te veel opties poll",
                options=[f"Optie {i}" for i in range(11)],
                end_date=end_date,
            )
        
        assert "10" in str(exc_info.value) or "max_length" in str(exc_info.value).lower()


class TestPollUpdateValidation:
    """Tests for PollUpdate schema."""

    def test_poll_update_partial(self):
        """Test that poll update accepts partial updates."""
        update = PollUpdate(title="Nieuwe titel")
        
        assert update.title == "Nieuwe titel"
        assert update.description is None
        assert update.status is None

    def test_poll_update_status_change(self):
        """Test updating poll status."""
        update = PollUpdate(status=PollStatus.OPEN)
        
        assert update.status == PollStatus.OPEN


class TestPollOptionResponse:
    """Tests for PollOptionResponse schema."""

    def test_poll_option_response_creation(self):
        """Test creating a poll option response."""
        option_id = uuid.uuid4()
        
        option = PollOptionResponse(
            id=option_id,
            text="Optie A",
            vote_count=25,
            percentage=Decimal("45.5"),
            display_order=0,
        )
        
        assert option.id == option_id
        assert option.text == "Optie A"
        assert option.vote_count == 25
        assert option.percentage == Decimal("45.5")
        assert option.display_order == 0


class TestPollResponse:
    """Tests for PollResponse schema."""

    def test_poll_response_creation(self):
        """Test creating a poll response."""
        poll_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        end_date = now + timedelta(days=7)
        
        response = PollResponse(
            id=poll_id,
            vve_id=vve_id,
            title="Test Poll",
            description="Test beschrijving",
            options=[
                PollOptionResponse(
                    id=uuid.uuid4(),
                    text="Optie 1",
                    vote_count=10,
                    percentage=Decimal("66.7"),
                    display_order=0,
                ),
                PollOptionResponse(
                    id=uuid.uuid4(),
                    text="Optie 2",
                    vote_count=5,
                    percentage=Decimal("33.3"),
                    display_order=1,
                ),
            ],
            end_date=end_date,
            allow_multiple=False,
            is_anonymous=False,
            results_visibility=PollResultsVisibility.ALL,
            total_votes=15,
            total_participants=15,
            status=PollStatus.OPEN,
            created_by_id=uuid.uuid4(),
            created_by_name="Jan Jansen",
            created_at=now,
            updated_at=now,
            is_active=True,
            days_remaining=7,
        )
        
        assert response.id == poll_id
        assert response.title == "Test Poll"
        assert len(response.options) == 2
        assert response.total_votes == 15
        assert response.is_active is True

    def test_poll_response_anonymous(self):
        """Test poll response for anonymous poll."""
        now = datetime.now(timezone.utc)
        
        response = PollResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Anonieme Poll",
            description=None,
            options=[],
            end_date=now + timedelta(days=3),
            allow_multiple=True,
            is_anonymous=True,
            results_visibility=PollResultsVisibility.AFTER_VOTE,
            total_votes=0,
            total_participants=0,
            status=PollStatus.DRAFT,
            created_by_id=None,
            created_at=now,
            updated_at=now,
        )
        
        assert response.is_anonymous is True
        assert response.results_visibility == PollResultsVisibility.AFTER_VOTE


class TestPollListResponse:
    """Tests for PollListResponse schema."""

    def test_poll_list_response_creation(self):
        """Test creating a poll list response."""
        poll_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = PollListResponse(
            id=poll_id,
            vve_id=vve_id,
            title="Snelle Poll",
            status=PollStatus.OPEN,
            end_date=now + timedelta(days=2),
            total_participants=42,
            is_anonymous=False,
            is_active=True,
            days_remaining=2,
        )
        
        assert response.id == poll_id
        assert response.total_participants == 42
        assert response.is_active is True


class TestPollVoteCreate:
    """Tests for PollVoteCreate schema."""

    def test_poll_vote_single_option(self):
        """Test voting on a single option."""
        option_id = uuid.uuid4()
        
        vote = PollVoteCreate(option_ids=[option_id])
        
        assert len(vote.option_ids) == 1
        assert vote.option_ids[0] == option_id

    def test_poll_vote_multiple_options(self):
        """Test voting on multiple options."""
        option_ids = [uuid.uuid4(), uuid.uuid4(), uuid.uuid4()]
        
        vote = PollVoteCreate(option_ids=option_ids)
        
        assert len(vote.option_ids) == 3

    def test_poll_vote_requires_at_least_one_option(self):
        """Test that vote requires at least one option."""
        with pytest.raises(ValueError) as exc_info:
            PollVoteCreate(option_ids=[])
        
        assert "1" in str(exc_info.value) or "min_length" in str(exc_info.value).lower()


class TestPollVoteResponse:
    """Tests for PollVoteResponse schema."""

    def test_poll_vote_response_creation(self):
        """Test creating a poll vote response."""
        poll_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        response = PollVoteResponse(
            poll_id=poll_id,
            poll_title="Test Poll",
            selected_options=["Optie A", "Optie B"],
            voted_at=now,
            message="Uw stem is succesvol geregistreerd",
        )
        
        assert response.poll_id == poll_id
        assert response.poll_title == "Test Poll"
        assert len(response.selected_options) == 2
        assert response.message == "Uw stem is succesvol geregistreerd"


class TestPollStatus:
    """Tests for PollStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert PollStatus.DRAFT == "draft"
        assert PollStatus.OPEN == "open"
        assert PollStatus.CLOSED == "closed"


class TestPollResultsVisibility:
    """Tests for PollResultsVisibility enum."""

    def test_all_visibilities_defined(self):
        """Test that all required visibility options are defined."""
        assert PollResultsVisibility.ALL == "all"
        assert PollResultsVisibility.BOARD_ONLY == "board_only"
        assert PollResultsVisibility.AFTER_VOTE == "after_vote"
