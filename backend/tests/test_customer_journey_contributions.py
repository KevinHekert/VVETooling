"""Tests for Customer Journey: Contributions & Payment Status.

Based on customer journeys:
- 3.1 Penningmeester: Contributie Incasso Cyclus
- 3.6 Bewoner: Eigen Status Checken (STORY-003)
- 3.7 Bewoner: ALV Voorbereiding

STORY-003: Als bewoner wil ik mijn eigen betalingsstatus zien,
zodat ik weet of mijn contributie op orde is.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.schemas.contribution import (
    ContributionStatus,
    ContributionCreate,
    ContributionResponse,
    ContributionPayment,
    BewonersStatusResponse,
)


class TestContributionCreateJourney:
    """Tests for creating contributions (3.1: Contributie Incasso Cyclus).
    
    Customer journey steps:
    1. Contributie periode starten
    2. Automatische berekening per eigenaar
    3. Facturen genereren
    """

    def test_contribution_create_valid(self):
        """Test creating a valid contribution record."""
        unit_id = uuid.uuid4()
        
        contribution = ContributionCreate(
            unit_id=unit_id,
            year=2026,
            month=1,
            amount_due=Decimal("250.00"),
            due_date=datetime(2026, 1, 25, tzinfo=timezone.utc),
        )
        
        assert contribution.unit_id == unit_id
        assert contribution.year == 2026
        assert contribution.month == 1
        assert contribution.amount_due == Decimal("250.00")

    def test_contribution_create_all_months(self):
        """Test contribution can be created for all 12 months."""
        unit_id = uuid.uuid4()
        
        for month in range(1, 13):
            contribution = ContributionCreate(
                unit_id=unit_id,
                year=2026,
                month=month,
                amount_due=Decimal("200.00"),
                due_date=datetime(2026, month, 25, tzinfo=timezone.utc),
            )
            assert contribution.month == month

    def test_contribution_year_validation_min(self):
        """Test year cannot be before 2000."""
        with pytest.raises(ValueError):
            ContributionCreate(
                unit_id=uuid.uuid4(),
                year=1999,  # Invalid
                month=1,
                amount_due=Decimal("200.00"),
                due_date=datetime.now(timezone.utc),
            )

    def test_contribution_year_validation_max(self):
        """Test year cannot be after 2100."""
        with pytest.raises(ValueError):
            ContributionCreate(
                unit_id=uuid.uuid4(),
                year=2101,  # Invalid
                month=1,
                amount_due=Decimal("200.00"),
                due_date=datetime.now(timezone.utc),
            )

    def test_contribution_month_validation_min(self):
        """Test month cannot be less than 1."""
        with pytest.raises(ValueError):
            ContributionCreate(
                unit_id=uuid.uuid4(),
                year=2026,
                month=0,  # Invalid
                amount_due=Decimal("200.00"),
                due_date=datetime.now(timezone.utc),
            )

    def test_contribution_month_validation_max(self):
        """Test month cannot be more than 12."""
        with pytest.raises(ValueError):
            ContributionCreate(
                unit_id=uuid.uuid4(),
                year=2026,
                month=13,  # Invalid
                amount_due=Decimal("200.00"),
                due_date=datetime.now(timezone.utc),
            )

    def test_contribution_amount_non_negative(self):
        """Test amount due cannot be negative."""
        with pytest.raises(ValueError):
            ContributionCreate(
                unit_id=uuid.uuid4(),
                year=2026,
                month=1,
                amount_due=Decimal("-100.00"),  # Invalid
                due_date=datetime.now(timezone.utc),
            )


class TestContributionPaymentJourney:
    """Tests for recording contribution payments.
    
    Customer journey 3.1:
    - Betalingen matchen
    - Ontvangt betalingen, matcht met openstaande facturen
    """

    def test_contribution_payment_full(self):
        """Test recording a full payment."""
        payment = ContributionPayment(
            amount=Decimal("250.00"),
            payment_date=datetime(2026, 1, 20, tzinfo=timezone.utc),
        )
        
        assert payment.amount == Decimal("250.00")

    def test_contribution_payment_partial(self):
        """Test recording a partial payment."""
        payment = ContributionPayment(
            amount=Decimal("125.00"),  # Half of due amount
            payment_date=datetime(2026, 1, 15, tzinfo=timezone.utc),
        )
        
        assert payment.amount == Decimal("125.00")

    def test_contribution_payment_non_negative(self):
        """Test payment amount cannot be negative."""
        with pytest.raises(ValueError):
            ContributionPayment(
                amount=Decimal("-50.00"),  # Invalid
                payment_date=datetime.now(timezone.utc),
            )


class TestContributionStatusJourney:
    """Tests for contribution status tracking."""

    def test_status_pending(self):
        """Test pending status."""
        assert ContributionStatus.PENDING.value == "pending"

    def test_status_paid(self):
        """Test paid status."""
        assert ContributionStatus.PAID.value == "paid"

    def test_status_overdue(self):
        """Test overdue status."""
        assert ContributionStatus.OVERDUE.value == "overdue"


class TestContributionResponseJourney:
    """Tests for contribution response schema."""

    def test_contribution_response_pending(self):
        """Test response for pending contribution."""
        now = datetime.now(timezone.utc)
        
        response = ContributionResponse(
            id=uuid.uuid4(),
            unit_id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            year=2026,
            month=1,
            amount_due=Decimal("250.00"),
            amount_paid=Decimal("0.00"),
            due_date=now,
            status=ContributionStatus.PENDING,
            created_at=now,
        )
        
        assert response.status == ContributionStatus.PENDING
        assert response.amount_paid == Decimal("0.00")

    def test_contribution_response_paid(self):
        """Test response for fully paid contribution."""
        now = datetime.now(timezone.utc)
        
        response = ContributionResponse(
            id=uuid.uuid4(),
            unit_id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            year=2026,
            month=1,
            amount_due=Decimal("250.00"),
            amount_paid=Decimal("250.00"),
            due_date=now,
            paid_at=now,
            status=ContributionStatus.PAID,
            created_at=now,
        )
        
        assert response.status == ContributionStatus.PAID
        assert response.amount_paid == response.amount_due


class TestBewonersStatusJourney:
    """Tests for Bewoner Status (STORY-003).
    
    Customer journey 3.6: Bewoner checkt eigen status
    - Inloggen
    - Eigen status bekijken: betaald dit jaar, openstaand, betalingshistorie
    - VVE status bekijken (algemene financiële stand)
    """

    def test_bewoners_status_up_to_date(self):
        """Test status for bewoner who is up to date with payments."""
        now = datetime.now(timezone.utc)
        
        status = BewonersStatusResponse(
            unit_id=uuid.uuid4(),
            unit_number="A1",
            vve_name="VVE Zonnelaan 1-10",
            current_month_due=Decimal("250.00"),
            current_month_paid=Decimal("250.00"),
            current_month_status=ContributionStatus.PAID,
            total_due_year=Decimal("3000.00"),
            total_paid_year=Decimal("3000.00"),
            outstanding_balance=Decimal("0.00"),
            is_up_to_date=True,
            has_overdue_payments=False,
        )
        
        assert status.is_up_to_date is True
        assert status.has_overdue_payments is False
        assert status.outstanding_balance == Decimal("0.00")

    def test_bewoners_status_outstanding(self):
        """Test status for bewoner with outstanding balance."""
        status = BewonersStatusResponse(
            unit_id=uuid.uuid4(),
            unit_number="B3",
            vve_name="VVE Maanstraat 5",
            current_month_due=Decimal("300.00"),
            current_month_paid=Decimal("0.00"),
            current_month_status=ContributionStatus.PENDING,
            total_due_year=Decimal("3600.00"),
            total_paid_year=Decimal("2700.00"),
            outstanding_balance=Decimal("900.00"),
            is_up_to_date=False,
            has_overdue_payments=True,
            next_due_date=datetime(2026, 2, 25, tzinfo=timezone.utc),
        )
        
        assert status.is_up_to_date is False
        assert status.has_overdue_payments is True
        assert status.outstanding_balance == Decimal("900.00")

    def test_bewoners_status_partial_payment(self):
        """Test status for bewoner with partial payment."""
        status = BewonersStatusResponse(
            unit_id=uuid.uuid4(),
            unit_number="C5",
            vve_name="VVE Sterplein 20",
            current_month_due=Decimal("200.00"),
            current_month_paid=Decimal("100.00"),
            current_month_status=ContributionStatus.PENDING,
            total_due_year=Decimal("2400.00"),
            total_paid_year=Decimal("2300.00"),
            outstanding_balance=Decimal("100.00"),
            is_up_to_date=False,
            has_overdue_payments=False,
        )
        
        assert status.current_month_paid < status.current_month_due
        assert status.outstanding_balance == Decimal("100.00")

    def test_bewoners_status_with_recent_contributions(self):
        """Test status includes recent contribution history."""
        now = datetime.now(timezone.utc)
        
        recent = [
            ContributionResponse(
                id=uuid.uuid4(),
                unit_id=uuid.uuid4(),
                vve_id=uuid.uuid4(),
                year=2026,
                month=i,
                amount_due=Decimal("250.00"),
                amount_paid=Decimal("250.00"),
                due_date=now,
                paid_at=now,
                status=ContributionStatus.PAID,
                created_at=now,
            )
            for i in range(1, 7)  # Last 6 months
        ]
        
        status = BewonersStatusResponse(
            unit_id=uuid.uuid4(),
            unit_number="A2",
            vve_name="VVE Zonnelaan 1-10",
            current_month_due=Decimal("250.00"),
            current_month_paid=Decimal("250.00"),
            current_month_status=ContributionStatus.PAID,
            total_due_year=Decimal("3000.00"),
            total_paid_year=Decimal("3000.00"),
            outstanding_balance=Decimal("0.00"),
            recent_contributions=recent,
            is_up_to_date=True,
            has_overdue_payments=False,
        )
        
        # Mobile-first: max 6 recent contributions
        assert len(status.recent_contributions) <= 6


class TestContributionDecimalPrecision:
    """Test decimal precision for contribution amounts."""

    def test_amount_due_precision(self):
        """Test amount due maintains precision."""
        contribution = ContributionCreate(
            unit_id=uuid.uuid4(),
            year=2026,
            month=1,
            amount_due=Decimal("199.99"),
            due_date=datetime.now(timezone.utc),
        )
        
        assert contribution.amount_due == Decimal("199.99")
        assert isinstance(contribution.amount_due, Decimal)

    def test_payment_precision(self):
        """Test payment amount maintains precision."""
        payment = ContributionPayment(
            amount=Decimal("99.50"),
            payment_date=datetime.now(timezone.utc),
        )
        
        assert payment.amount == Decimal("99.50")
