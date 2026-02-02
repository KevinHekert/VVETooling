"""Tests for Supplier Evaluation schemas - STORY-061.

Tests for supplier evaluation functionality with star ratings.
"""

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.ticket import (
    SupplierEvaluationCreate,
    SupplierEvaluationUpdate,
    SupplierEvaluationResponse,
    SupplierWithEvaluationSummary,
)


class TestSupplierEvaluationSchemas:
    """Tests for STORY-061: Leverancier evaluatie toevoegen."""

    def test_evaluation_create_valid(self):
        """Test creating a valid evaluation."""
        supplier_id = uuid.uuid4()
        evaluation = SupplierEvaluationCreate(
            supplier_id=supplier_id,
            rating=5,
            feedback="Uitstekende service, zeer tevreden!",
            is_anonymous=False,
        )

        assert evaluation.supplier_id == supplier_id
        assert evaluation.rating == 5
        assert evaluation.feedback == "Uitstekende service, zeer tevreden!"
        assert evaluation.is_anonymous is False
        assert evaluation.contract_id is None

    def test_evaluation_create_minimal(self):
        """Test creating an evaluation with only required fields."""
        supplier_id = uuid.uuid4()
        evaluation = SupplierEvaluationCreate(
            supplier_id=supplier_id,
            rating=3,
        )

        assert evaluation.supplier_id == supplier_id
        assert evaluation.rating == 3
        assert evaluation.feedback is None
        assert evaluation.is_anonymous is False
        assert evaluation.contract_id is None

    def test_evaluation_create_with_contract(self):
        """Test creating an evaluation linked to a contract."""
        supplier_id = uuid.uuid4()
        contract_id = uuid.uuid4()
        evaluation = SupplierEvaluationCreate(
            supplier_id=supplier_id,
            contract_id=contract_id,
            rating=4,
            feedback="Goede samenwerking",
            is_anonymous=True,
        )

        assert evaluation.supplier_id == supplier_id
        assert evaluation.contract_id == contract_id
        assert evaluation.rating == 4
        assert evaluation.is_anonymous is True

    def test_evaluation_create_rating_too_low(self):
        """Test that rating below 1 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            SupplierEvaluationCreate(
                supplier_id=uuid.uuid4(),
                rating=0,  # Invalid: too low
            )
        
        assert "rating" in str(exc_info.value)

    def test_evaluation_create_rating_too_high(self):
        """Test that rating above 5 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            SupplierEvaluationCreate(
                supplier_id=uuid.uuid4(),
                rating=6,  # Invalid: too high
            )
        
        assert "rating" in str(exc_info.value)

    def test_evaluation_create_all_ratings_valid(self):
        """Test that all ratings from 1 to 5 are valid."""
        supplier_id = uuid.uuid4()
        for rating in range(1, 6):
            evaluation = SupplierEvaluationCreate(
                supplier_id=supplier_id,
                rating=rating,
            )
            assert evaluation.rating == rating

    def test_evaluation_create_feedback_too_long(self):
        """Test that feedback over 2000 characters is rejected."""
        with pytest.raises(ValidationError):
            SupplierEvaluationCreate(
                supplier_id=uuid.uuid4(),
                rating=4,
                feedback="A" * 2001,  # Invalid: too long
            )

    def test_evaluation_create_feedback_max_length(self):
        """Test that feedback of exactly 2000 characters is valid."""
        evaluation = SupplierEvaluationCreate(
            supplier_id=uuid.uuid4(),
            rating=4,
            feedback="A" * 2000,
        )
        assert len(evaluation.feedback) == 2000

    def test_evaluation_update_partial(self):
        """Test partial update of evaluation."""
        update = SupplierEvaluationUpdate(
            rating=4,
        )

        assert update.rating == 4
        assert update.feedback is None
        assert update.is_anonymous is None

    def test_evaluation_update_all_fields(self):
        """Test updating all fields."""
        update = SupplierEvaluationUpdate(
            rating=2,
            feedback="Bijgewerkte feedback",
            is_anonymous=True,
        )

        assert update.rating == 2
        assert update.feedback == "Bijgewerkte feedback"
        assert update.is_anonymous is True

    def test_evaluation_update_empty(self):
        """Test empty update is valid."""
        update = SupplierEvaluationUpdate()

        assert update.rating is None
        assert update.feedback is None
        assert update.is_anonymous is None

    def test_evaluation_update_rating_too_low(self):
        """Test that update with rating below 1 is rejected."""
        with pytest.raises(ValidationError):
            SupplierEvaluationUpdate(rating=0)

    def test_evaluation_update_rating_too_high(self):
        """Test that update with rating above 5 is rejected."""
        with pytest.raises(ValidationError):
            SupplierEvaluationUpdate(rating=6)

    def test_evaluation_response(self):
        """Test evaluation response schema."""
        eval_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        supplier_id = uuid.uuid4()
        contract_id = uuid.uuid4()
        created_by_id = uuid.uuid4()
        created_at = datetime(2026, 2, 1, 10, 30, tzinfo=timezone.utc)

        response = SupplierEvaluationResponse(
            id=eval_id,
            vve_id=vve_id,
            supplier_id=supplier_id,
            supplier_name="Test Leverancier",
            contract_id=contract_id,
            contract_description="Onderhoudscontract 2026",
            rating=5,
            feedback="Zeer tevreden",
            is_anonymous=False,
            created_by_id=created_by_id,
            created_by_name="Jan Pietersen",
            created_at=created_at,
        )

        assert response.id == eval_id
        assert response.vve_id == vve_id
        assert response.supplier_id == supplier_id
        assert response.supplier_name == "Test Leverancier"
        assert response.contract_id == contract_id
        assert response.contract_description == "Onderhoudscontract 2026"
        assert response.rating == 5
        assert response.feedback == "Zeer tevreden"
        assert response.is_anonymous is False
        assert response.created_by_id == created_by_id
        assert response.created_by_name == "Jan Pietersen"
        assert response.created_at == created_at

    def test_evaluation_response_anonymous(self):
        """Test evaluation response for anonymous evaluation."""
        eval_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        supplier_id = uuid.uuid4()
        created_by_id = uuid.uuid4()
        created_at = datetime(2026, 2, 1, 10, 30, tzinfo=timezone.utc)

        response = SupplierEvaluationResponse(
            id=eval_id,
            vve_id=vve_id,
            supplier_id=supplier_id,
            rating=3,
            is_anonymous=True,
            created_by_id=created_by_id,
            created_by_name=None,  # Hidden for anonymous
            created_at=created_at,
        )

        assert response.is_anonymous is True
        assert response.created_by_name is None

    def test_supplier_with_evaluation_summary(self):
        """Test supplier response with evaluation summary."""
        supplier_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        created_at = datetime(2026, 1, 15, tzinfo=timezone.utc)
        updated_at = datetime(2026, 1, 20, tzinfo=timezone.utc)

        summary = SupplierWithEvaluationSummary(
            id=supplier_id,
            vve_id=vve_id,
            name="Test Leverancier B.V.",
            category="onderhoud",
            contact_email="info@test.nl",
            is_active=True,
            created_at=created_at,
            updated_at=updated_at,
            average_rating=4.5,
            evaluation_count=10,
        )

        assert summary.name == "Test Leverancier B.V."
        assert summary.average_rating == 4.5
        assert summary.evaluation_count == 10

    def test_supplier_with_evaluation_summary_no_evaluations(self):
        """Test supplier with no evaluations has null average."""
        supplier_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        created_at = datetime(2026, 1, 15, tzinfo=timezone.utc)
        updated_at = datetime(2026, 1, 15, tzinfo=timezone.utc)

        summary = SupplierWithEvaluationSummary(
            id=supplier_id,
            vve_id=vve_id,
            name="Nieuwe Leverancier",
            category="schoonmaak",
            is_active=True,
            created_at=created_at,
            updated_at=updated_at,
            average_rating=None,
            evaluation_count=0,
        )

        assert summary.average_rating is None
        assert summary.evaluation_count == 0
