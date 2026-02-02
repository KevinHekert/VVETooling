"""Tests for STORY-078: Compliance status per categorie.

Tests for compliance dashboard and status functionality.
"""

import uuid
from datetime import datetime, timezone, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.compliance import (
    ComplianceCategory,
    ComplianceCategorySummary,
    ComplianceCompletionRequest,
    ComplianceCompletionResponse,
    ComplianceDashboard,
    ComplianceItemCreate,
    ComplianceItemResponse,
    ComplianceItemUpdate,
    ComplianceStatus,
)


class TestComplianceSchemas:
    """Tests for STORY-078: Compliance status per categorie bekijken."""

    def test_compliance_category_values(self):
        """Test all compliance category values."""
        assert ComplianceCategory.KVK == "kvk"
        assert ComplianceCategory.VERZEKERING == "verzekering"
        assert ComplianceCategory.AVG == "avg"
        assert ComplianceCategory.ALV == "alv"
        assert ComplianceCategory.ONDERHOUD == "onderhoud"
        assert ComplianceCategory.FINANCIEEL == "financieel"
        assert ComplianceCategory.OVERIG == "overig"

    def test_compliance_status_values(self):
        """Test all compliance status values."""
        assert ComplianceStatus.COMPLIANT == "compliant"
        assert ComplianceStatus.AANDACHT == "aandacht"
        assert ComplianceStatus.NIET_COMPLIANT == "niet_compliant"

    def test_compliance_item_create_valid(self):
        """Test creating a valid compliance item."""
        item = ComplianceItemCreate(
            title="KvK inschrijving vernieuwen",
            description="Jaarlijkse vernieuwing van KvK inschrijving",
            category=ComplianceCategory.KVK,
            deadline=datetime(2026, 12, 31, tzinfo=timezone.utc),
            alert_days_before=30,
            is_recurring=True,
            recurrence_months=12,
        )

        assert item.title == "KvK inschrijving vernieuwen"
        assert item.category == ComplianceCategory.KVK
        assert item.alert_days_before == 30
        assert item.is_recurring is True
        assert item.recurrence_months == 12

    def test_compliance_item_create_minimal(self):
        """Test creating a compliance item with only required fields."""
        item = ComplianceItemCreate(
            title="Verzekering controleren",
            category=ComplianceCategory.VERZEKERING,
        )

        assert item.title == "Verzekering controleren"
        assert item.category == ComplianceCategory.VERZEKERING
        assert item.deadline is None
        assert item.alert_days_before == 30  # Default
        assert item.is_recurring is False  # Default
        assert item.recurrence_months is None

    def test_compliance_item_create_title_too_short(self):
        """Test that empty title is rejected."""
        with pytest.raises(ValidationError):
            ComplianceItemCreate(
                title="",
                category=ComplianceCategory.AVG,
            )

    def test_compliance_item_create_title_too_long(self):
        """Test that title over 255 characters is rejected."""
        with pytest.raises(ValidationError):
            ComplianceItemCreate(
                title="A" * 256,
                category=ComplianceCategory.AVG,
            )

    def test_compliance_item_create_alert_days_out_of_range(self):
        """Test that alert days must be between 1 and 365."""
        with pytest.raises(ValidationError):
            ComplianceItemCreate(
                title="Test",
                category=ComplianceCategory.AVG,
                alert_days_before=0,
            )

        with pytest.raises(ValidationError):
            ComplianceItemCreate(
                title="Test",
                category=ComplianceCategory.AVG,
                alert_days_before=400,
            )

    def test_compliance_item_update_partial(self):
        """Test partial update of compliance item."""
        update = ComplianceItemUpdate(
            title="Nieuwe titel",
        )

        assert update.title == "Nieuwe titel"
        assert update.category is None
        assert update.deadline is None

    def test_compliance_category_summary(self):
        """Test compliance category summary schema."""
        summary = ComplianceCategorySummary(
            category=ComplianceCategory.KVK,
            category_label="KvK Registratie",
            total_items=5,
            completed_items=4,
            pending_items=1,
            overdue_items=0,
            status=ComplianceStatus.AANDACHT,
            compliance_percentage=80.0,
        )

        assert summary.category == ComplianceCategory.KVK
        assert summary.category_label == "KvK Registratie"
        assert summary.total_items == 5
        assert summary.completed_items == 4
        assert summary.compliance_percentage == 80.0

    def test_compliance_category_summary_fully_compliant(self):
        """Test summary for fully compliant category."""
        summary = ComplianceCategorySummary(
            category=ComplianceCategory.VERZEKERING,
            category_label="Verzekeringen",
            total_items=3,
            completed_items=3,
            pending_items=0,
            overdue_items=0,
            status=ComplianceStatus.COMPLIANT,
            compliance_percentage=100.0,
        )

        assert summary.status == ComplianceStatus.COMPLIANT
        assert summary.compliance_percentage == 100.0
        assert summary.overdue_items == 0

    def test_compliance_category_summary_with_overdue(self):
        """Test summary with overdue items."""
        summary = ComplianceCategorySummary(
            category=ComplianceCategory.ALV,
            category_label="Algemene Ledenvergadering",
            total_items=2,
            completed_items=0,
            pending_items=2,
            overdue_items=1,
            status=ComplianceStatus.NIET_COMPLIANT,
            compliance_percentage=0.0,
        )

        assert summary.status == ComplianceStatus.NIET_COMPLIANT
        assert summary.overdue_items == 1

    def test_compliance_dashboard(self):
        """Test compliance dashboard schema."""
        vve_id = uuid.uuid4()
        categories = [
            ComplianceCategorySummary(
                category=ComplianceCategory.KVK,
                category_label="KvK Registratie",
                total_items=2,
                completed_items=2,
                pending_items=0,
                overdue_items=0,
                status=ComplianceStatus.COMPLIANT,
                compliance_percentage=100.0,
            ),
            ComplianceCategorySummary(
                category=ComplianceCategory.VERZEKERING,
                category_label="Verzekeringen",
                total_items=3,
                completed_items=2,
                pending_items=1,
                overdue_items=0,
                status=ComplianceStatus.AANDACHT,
                compliance_percentage=66.7,
            ),
        ]

        dashboard = ComplianceDashboard(
            vve_id=vve_id,
            overall_compliance_percentage=80.0,
            overall_status=ComplianceStatus.AANDACHT,
            total_items=5,
            completed_items=4,
            pending_items=1,
            overdue_items=0,
            categories=categories,
            upcoming_deadlines=[],
        )

        assert dashboard.vve_id == vve_id
        assert dashboard.overall_compliance_percentage == 80.0
        assert dashboard.overall_status == ComplianceStatus.AANDACHT
        assert len(dashboard.categories) == 2
        assert dashboard.total_items == 5

    def test_compliance_dashboard_empty(self):
        """Test dashboard with no compliance items."""
        dashboard = ComplianceDashboard(
            vve_id=uuid.uuid4(),
            overall_compliance_percentage=100.0,
            overall_status=ComplianceStatus.COMPLIANT,
            total_items=0,
            completed_items=0,
            pending_items=0,
            overdue_items=0,
            categories=[],
            upcoming_deadlines=[],
        )

        assert dashboard.total_items == 0
        assert dashboard.overall_compliance_percentage == 100.0
        assert len(dashboard.categories) == 0

    def test_compliance_completion_request(self):
        """Test completion request with all fields."""
        request = ComplianceCompletionRequest(
            evidence_document_id=uuid.uuid4(),
            notes="Bijgevoegd: KvK uittreksel 2026",
            completion_date=datetime(2026, 2, 1, tzinfo=timezone.utc),
        )

        assert request.evidence_document_id is not None
        assert "KvK uittreksel" in request.notes

    def test_compliance_completion_request_minimal(self):
        """Test completion request with minimal fields."""
        request = ComplianceCompletionRequest()

        assert request.evidence_document_id is None
        assert request.notes is None
        assert request.completion_date is None

    def test_compliance_completion_request_notes_too_long(self):
        """Test that notes over 2000 characters is rejected."""
        with pytest.raises(ValidationError):
            ComplianceCompletionRequest(
                notes="A" * 2001,
            )

    def test_compliance_completion_response(self):
        """Test completion response schema."""
        response = ComplianceCompletionResponse(
            compliance_item_id=uuid.uuid4(),
            completed_at=datetime(2026, 2, 1, tzinfo=timezone.utc),
            completed_by_name="Jan Pietersen",
            evidence_document_name="KvK uittreksel 2026.pdf",
            message="Compliance item succesvol afgevinkt",
        )

        assert response.completed_by_name == "Jan Pietersen"
        assert response.evidence_document_name == "KvK uittreksel 2026.pdf"
        assert "succesvol" in response.message

    def test_compliance_item_response(self):
        """Test compliance item response schema."""
        item_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
        updated_at = datetime(2026, 1, 15, tzinfo=timezone.utc)
        deadline = datetime(2026, 12, 31, tzinfo=timezone.utc)

        response = ComplianceItemResponse(
            id=item_id,
            vve_id=vve_id,
            title="KvK inschrijving vernieuwen",
            description="Jaarlijkse vernieuwing",
            category=ComplianceCategory.KVK,
            deadline=deadline,
            alert_days_before=30,
            is_recurring=True,
            recurrence_months=12,
            status=ComplianceStatus.AANDACHT,
            is_completed=False,
            created_at=created_at,
            updated_at=updated_at,
            days_until_deadline=330,
            is_deadline_approaching=False,
            is_overdue=False,
        )

        assert response.id == item_id
        assert response.title == "KvK inschrijving vernieuwen"
        assert response.category == ComplianceCategory.KVK
        assert response.status == ComplianceStatus.AANDACHT
        assert response.is_completed is False
        assert response.days_until_deadline == 330

    def test_compliance_item_response_completed(self):
        """Test completed compliance item response."""
        response = ComplianceItemResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="Verzekering gecontroleerd",
            category=ComplianceCategory.VERZEKERING,
            alert_days_before=30,
            is_recurring=False,
            status=ComplianceStatus.COMPLIANT,
            is_completed=True,
            completed_at=datetime(2026, 2, 1, tzinfo=timezone.utc),
            completed_by_id=uuid.uuid4(),
            completed_by_name="Anna de Vries",
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            updated_at=datetime(2026, 2, 1, tzinfo=timezone.utc),
            is_deadline_approaching=False,
            is_overdue=False,
        )

        assert response.is_completed is True
        assert response.status == ComplianceStatus.COMPLIANT
        assert response.completed_by_name == "Anna de Vries"

    def test_compliance_item_response_overdue(self):
        """Test overdue compliance item response."""
        response = ComplianceItemResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            title="ALV organiseren",
            category=ComplianceCategory.ALV,
            deadline=datetime(2025, 12, 31, tzinfo=timezone.utc),
            alert_days_before=30,
            is_recurring=True,
            recurrence_months=12,
            status=ComplianceStatus.NIET_COMPLIANT,
            is_completed=False,
            created_at=datetime(2025, 6, 1, tzinfo=timezone.utc),
            updated_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            days_until_deadline=-32,
            is_deadline_approaching=False,
            is_overdue=True,
        )

        assert response.is_overdue is True
        assert response.status == ComplianceStatus.NIET_COMPLIANT
        assert response.days_until_deadline == -32
