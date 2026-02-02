"""Tests for STORY-120: Notulen delen met eigenaren.

Tests for minutes publishing and sharing functionality.
"""

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.meeting import (
    MinutesPublishRequest,
    MinutesPublishResponse,
    MinutesStatus,
    PublishedMinutesSummary,
    PublishedMinutesListResponse,
)


class TestMinutesPublishSchemas:
    """Tests for STORY-120: Notulen delen met eigenaren."""

    def test_publish_request_default(self):
        """Test default publish request."""
        request = MinutesPublishRequest()
        
        assert request.send_email_notification is True
        assert request.email_subject is None
        assert request.email_message is None

    def test_publish_request_without_email(self):
        """Test publish request without email notification."""
        request = MinutesPublishRequest(
            send_email_notification=False
        )
        
        assert request.send_email_notification is False

    def test_publish_request_with_custom_email(self):
        """Test publish request with custom email content."""
        request = MinutesPublishRequest(
            send_email_notification=True,
            email_subject="Notulen ALV 2026 beschikbaar",
            email_message="Beste eigenaar, de notulen zijn nu beschikbaar."
        )
        
        assert request.send_email_notification is True
        assert request.email_subject == "Notulen ALV 2026 beschikbaar"
        assert request.email_message == "Beste eigenaar, de notulen zijn nu beschikbaar."

    def test_publish_request_subject_too_long(self):
        """Test that subject over 255 characters is rejected."""
        with pytest.raises(ValidationError):
            MinutesPublishRequest(
                email_subject="A" * 256
            )

    def test_publish_request_message_too_long(self):
        """Test that message over 2000 characters is rejected."""
        with pytest.raises(ValidationError):
            MinutesPublishRequest(
                email_message="A" * 2001
            )

    def test_publish_request_subject_max_length(self):
        """Test that subject of exactly 255 characters is valid."""
        request = MinutesPublishRequest(
            email_subject="A" * 255
        )
        assert len(request.email_subject) == 255

    def test_publish_request_message_max_length(self):
        """Test that message of exactly 2000 characters is valid."""
        request = MinutesPublishRequest(
            email_message="A" * 2000
        )
        assert len(request.email_message) == 2000

    def test_publish_response(self):
        """Test publish response schema."""
        minutes_id = uuid.uuid4()
        meeting_id = uuid.uuid4()
        published_at = datetime.now(timezone.utc)

        response = MinutesPublishResponse(
            success=True,
            minutes_id=minutes_id,
            meeting_id=meeting_id,
            published_at=published_at,
            emails_sent=15,
            emails_failed=0,
            message="Notulen succesvol gepubliceerd. 15 e-mail(s) verzonden."
        )

        assert response.success is True
        assert response.minutes_id == minutes_id
        assert response.meeting_id == meeting_id
        assert response.published_at == published_at
        assert response.emails_sent == 15
        assert response.emails_failed == 0
        assert "15 e-mail(s)" in response.message

    def test_publish_response_partial_failure(self):
        """Test publish response with partial email failures."""
        response = MinutesPublishResponse(
            success=True,
            minutes_id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            published_at=datetime.now(timezone.utc),
            emails_sent=12,
            emails_failed=3,
            message="Notulen gepubliceerd. 12 e-mail(s) verzonden, 3 mislukt."
        )

        assert response.success is True
        assert response.emails_sent == 12
        assert response.emails_failed == 3

    def test_published_minutes_summary(self):
        """Test published minutes summary schema."""
        summary = PublishedMinutesSummary(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            meeting_title="ALV 2026",
            meeting_date=datetime(2026, 3, 15, 19, 0, tzinfo=timezone.utc),
            published_at=datetime(2026, 3, 20, 10, 0, tzinfo=timezone.utc),
            status=MinutesStatus.PUBLISHED,
        )

        assert summary.meeting_title == "ALV 2026"
        assert summary.status == MinutesStatus.PUBLISHED
        assert summary.published_at.month == 3

    def test_published_minutes_summary_approved(self):
        """Test published minutes summary with approved status."""
        summary = PublishedMinutesSummary(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            meeting_title="Buitengewone ALV",
            meeting_date=datetime(2026, 6, 1, 14, 0, tzinfo=timezone.utc),
            published_at=datetime(2026, 6, 5, 9, 0, tzinfo=timezone.utc),
            status=MinutesStatus.APPROVED,
        )

        assert summary.status == MinutesStatus.APPROVED

    def test_published_minutes_list_response(self):
        """Test published minutes list response."""
        items = [
            PublishedMinutesSummary(
                id=uuid.uuid4(),
                meeting_id=uuid.uuid4(),
                meeting_title="ALV 2026",
                meeting_date=datetime(2026, 3, 15, 19, 0, tzinfo=timezone.utc),
                published_at=datetime(2026, 3, 20, 10, 0, tzinfo=timezone.utc),
                status=MinutesStatus.PUBLISHED,
            ),
            PublishedMinutesSummary(
                id=uuid.uuid4(),
                meeting_id=uuid.uuid4(),
                meeting_title="ALV 2025",
                meeting_date=datetime(2025, 3, 10, 19, 0, tzinfo=timezone.utc),
                published_at=datetime(2025, 3, 15, 10, 0, tzinfo=timezone.utc),
                status=MinutesStatus.APPROVED,
            ),
        ]

        response = PublishedMinutesListResponse(
            items=items,
            total=2
        )

        assert len(response.items) == 2
        assert response.total == 2
        assert response.items[0].meeting_title == "ALV 2026"
        assert response.items[1].meeting_title == "ALV 2025"

    def test_published_minutes_list_response_empty(self):
        """Test published minutes list with no items."""
        response = PublishedMinutesListResponse(
            items=[],
            total=0
        )

        assert len(response.items) == 0
        assert response.total == 0

    def test_minutes_status_values(self):
        """Test all minutes status values are valid."""
        valid_statuses = [
            MinutesStatus.DRAFT,
            MinutesStatus.PUBLISHED,
            MinutesStatus.APPROVED,
        ]

        for status in valid_statuses:
            summary = PublishedMinutesSummary(
                id=uuid.uuid4(),
                meeting_id=uuid.uuid4(),
                meeting_title="Test",
                meeting_date=datetime.now(timezone.utc),
                published_at=datetime.now(timezone.utc),
                status=status,
            )
            assert summary.status == status
