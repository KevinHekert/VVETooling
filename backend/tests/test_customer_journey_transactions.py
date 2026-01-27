"""Tests for Customer Journey: Transactions & Financial Management.

Based on customer journeys:
- 3.1 Penningmeester: Contributie Incasso Cyclus
- 3.2 Penningmeester: Factuur Verwerken
- 3.3 Penningmeester: Maandelijkse Rapportage
- 5.2 Penningmeester Corrigeert Fout

STORY-001: Als penningmeester wil ik een transactie toevoegen met
bedrag, datum en categorie, zodat mijn financieel overzicht actueel blijft.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.schemas.transaction import (
    TransactionCategory,
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionSummary,
)


class TestTransactionCreateJourney:
    """Tests for Transaction creation (STORY-001).
    
    Customer journey 3.2: Penningmeester verwerkt factuur
    - Factuur ontvangen
    - Uploaden
    - Gegevens invoeren: bedrag, leverancier, categorie, reserve
    """

    def test_transaction_create_maintenance(self):
        """Test creating a maintenance transaction (factuur)."""
        transaction = TransactionCreate(
            amount=Decimal("-1500.00"),  # Expense
            category=TransactionCategory.MAINTENANCE,
            description="Dakonderhoud januari 2026",
            transaction_date=datetime(2026, 1, 15, tzinfo=timezone.utc),
        )
        
        assert transaction.amount == Decimal("-1500.00")
        assert transaction.category == TransactionCategory.MAINTENANCE
        assert transaction.description == "Dakonderhoud januari 2026"

    def test_transaction_create_energy(self):
        """Test creating an energy expense transaction."""
        transaction = TransactionCreate(
            amount=Decimal("-850.50"),
            category=TransactionCategory.ENERGY,
            description="Elektriciteit algemene ruimtes Q4 2025",
            transaction_date=datetime(2026, 1, 10, tzinfo=timezone.utc),
        )
        
        assert transaction.category == TransactionCategory.ENERGY

    def test_transaction_create_insurance(self):
        """Test creating an insurance expense transaction."""
        transaction = TransactionCreate(
            amount=Decimal("-2400.00"),
            category=TransactionCategory.INSURANCE,
            description="Opstalverzekering 2026",
            transaction_date=datetime(2026, 1, 5, tzinfo=timezone.utc),
        )
        
        assert transaction.category == TransactionCategory.INSURANCE

    def test_transaction_create_contribution_income(self):
        """Test creating a contribution income transaction."""
        transaction = TransactionCreate(
            amount=Decimal("200.00"),  # Income (positive)
            category=TransactionCategory.CONTRIBUTION,
            description="Contributie jan 2026 - Appartement A1",
            transaction_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        
        assert transaction.amount > 0
        assert transaction.category == TransactionCategory.CONTRIBUTION

    def test_transaction_create_with_reserve_fund(self):
        """Test creating transaction linked to reserve fund."""
        reserve_id = uuid.uuid4()
        
        transaction = TransactionCreate(
            amount=Decimal("-5000.00"),
            category=TransactionCategory.RESERVE,
            description="Onttrekking uit reservefonds voor schilderwerk",
            transaction_date=datetime(2026, 1, 20, tzinfo=timezone.utc),
            reserve_fund_id=reserve_id,
        )
        
        assert transaction.reserve_fund_id == reserve_id

    def test_transaction_create_administrative(self):
        """Test creating administrative expense."""
        transaction = TransactionCreate(
            amount=Decimal("-150.00"),
            category=TransactionCategory.ADMINISTRATIVE,
            description="Jaarlijkse KvK-bijdrage",
            transaction_date=datetime(2026, 1, 3, tzinfo=timezone.utc),
        )
        
        assert transaction.category == TransactionCategory.ADMINISTRATIVE

    def test_transaction_create_other_category(self):
        """Test creating transaction with other category."""
        transaction = TransactionCreate(
            amount=Decimal("-75.00"),
            category=TransactionCategory.OTHER,
            description="Diversen - bloemen ALV",
            transaction_date=datetime(2026, 1, 25, tzinfo=timezone.utc),
        )
        
        assert transaction.category == TransactionCategory.OTHER

    def test_all_transaction_categories(self):
        """Test all transaction categories are supported."""
        for category in TransactionCategory:
            transaction = TransactionCreate(
                amount=Decimal("100.00"),
                category=category,
                description=f"Test {category.value}",
                transaction_date=datetime.now(timezone.utc),
            )
            assert transaction.category == category


class TestTransactionUpdateJourney:
    """Tests for Transaction updates (STORY 5.2: Fout corrigeren).
    
    Customer journey 5.2: Penningmeester Corrigeert Fout
    - Fout ontdekken
    - Transactie zoeken
    - Correctie maken of transactie wijzigen
    """

    def test_transaction_update_amount(self):
        """Test correcting transaction amount."""
        update = TransactionUpdate(
            amount=Decimal("-1650.00"),  # Corrected from -1500.00
        )
        
        assert update.amount == Decimal("-1650.00")
        assert update.category is None  # Other fields not changed

    def test_transaction_update_category(self):
        """Test correcting transaction category."""
        update = TransactionUpdate(
            category=TransactionCategory.ENERGY,  # Was incorrectly categorized
        )
        
        assert update.category == TransactionCategory.ENERGY

    def test_transaction_update_description(self):
        """Test updating transaction description/notes."""
        update = TransactionUpdate(
            description="[CORRECTIE] Dakonderhoud januari 2026 - gecorrigeerd bedrag",
        )
        
        assert "CORRECTIE" in update.description

    def test_transaction_update_multiple_fields(self):
        """Test updating multiple fields at once."""
        update = TransactionUpdate(
            amount=Decimal("-1800.00"),
            category=TransactionCategory.MAINTENANCE,
            description="Gecorrigeerde boeking",
        )
        
        assert update.amount == Decimal("-1800.00")
        assert update.category == TransactionCategory.MAINTENANCE

    def test_transaction_update_reserve_fund(self):
        """Test linking transaction to different reserve fund."""
        new_reserve_id = uuid.uuid4()
        
        update = TransactionUpdate(
            reserve_fund_id=new_reserve_id,
        )
        
        assert update.reserve_fund_id == new_reserve_id


class TestTransactionResponseJourney:
    """Tests for Transaction response schema."""

    def test_transaction_response_complete(self):
        """Test complete transaction response."""
        now = datetime.now(timezone.utc)
        response = TransactionResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            amount=Decimal("-500.00"),
            category=TransactionCategory.MAINTENANCE,
            description="Test transaction",
            transaction_date=now,
            created_at=now,
            updated_at=now,
        )
        
        assert response.id is not None
        assert response.vve_id is not None
        assert response.amount == Decimal("-500.00")


class TestTransactionSummaryJourney:
    """Tests for Transaction summary (Customer journey 3.3: Maandelijkse Rapportage).
    
    Customer journey 3.3: Penningmeester maakt maandelijks overzicht
    - Periode afsluiten
    - Rapportage genereren: inkomsten, uitgaven, saldo's
    - Reserve controle
    """

    def test_transaction_summary_balanced(self):
        """Test balanced transaction summary."""
        summary = TransactionSummary(
            total_income=Decimal("5000.00"),
            total_expenses=Decimal("3000.00"),
            net_balance=Decimal("2000.00"),
            transaction_count=25,
            by_category={
                "contribution": Decimal("5000.00"),
                "maintenance": Decimal("-1500.00"),
                "energy": Decimal("-800.00"),
                "insurance": Decimal("-500.00"),
                "administrative": Decimal("-200.00"),
            },
        )
        
        assert summary.total_income == Decimal("5000.00")
        assert summary.total_expenses == Decimal("3000.00")
        assert summary.net_balance == Decimal("2000.00")
        assert summary.transaction_count == 25

    def test_transaction_summary_deficit(self):
        """Test summary with deficit (expenses > income)."""
        summary = TransactionSummary(
            total_income=Decimal("3000.00"),
            total_expenses=Decimal("4500.00"),
            net_balance=Decimal("-1500.00"),
            transaction_count=15,
            by_category={},
        )
        
        assert summary.net_balance < 0

    def test_transaction_summary_category_breakdown(self):
        """Test summary with category breakdown for reports."""
        summary = TransactionSummary(
            total_income=Decimal("10000.00"),
            total_expenses=Decimal("8000.00"),
            net_balance=Decimal("2000.00"),
            transaction_count=50,
            by_category={
                "maintenance": Decimal("-3000.00"),
                "energy": Decimal("-2000.00"),
                "insurance": Decimal("-1500.00"),
                "administrative": Decimal("-500.00"),
                "reserve": Decimal("-1000.00"),
            },
        )
        
        # Verify all categories are present
        assert "maintenance" in summary.by_category
        assert "energy" in summary.by_category
        assert summary.by_category["maintenance"] == Decimal("-3000.00")


class TestTransactionCategoryTypes:
    """Test all transaction category types are properly defined."""

    def test_contribution_category(self):
        """Test contribution category for monthly fees."""
        assert TransactionCategory.CONTRIBUTION.value == "contribution"

    def test_maintenance_category(self):
        """Test maintenance category for repairs and upkeep."""
        assert TransactionCategory.MAINTENANCE.value == "maintenance"

    def test_energy_category(self):
        """Test energy category for utilities."""
        assert TransactionCategory.ENERGY.value == "energy"

    def test_insurance_category(self):
        """Test insurance category."""
        assert TransactionCategory.INSURANCE.value == "insurance"

    def test_administrative_category(self):
        """Test administrative category for office costs."""
        assert TransactionCategory.ADMINISTRATIVE.value == "administrative"

    def test_reserve_category(self):
        """Test reserve category for reserve fund transactions."""
        assert TransactionCategory.RESERVE.value == "reserve"

    def test_other_category(self):
        """Test other category for miscellaneous."""
        assert TransactionCategory.OTHER.value == "other"


class TestTransactionDecimalPrecision:
    """Test decimal precision for financial accuracy."""

    def test_amount_two_decimal_places(self):
        """Test amounts maintain 2 decimal precision."""
        transaction = TransactionCreate(
            amount=Decimal("1234.56"),
            category=TransactionCategory.CONTRIBUTION,
            description="Test",
            transaction_date=datetime.now(timezone.utc),
        )
        
        assert transaction.amount == Decimal("1234.56")
        assert isinstance(transaction.amount, Decimal)

    def test_large_amounts(self):
        """Test handling of large amounts."""
        transaction = TransactionCreate(
            amount=Decimal("999999.99"),
            category=TransactionCategory.RESERVE,
            description="Large reserve fund transaction",
            transaction_date=datetime.now(timezone.utc),
        )
        
        assert transaction.amount == Decimal("999999.99")

    def test_negative_expense_amounts(self):
        """Test negative amounts for expenses."""
        transaction = TransactionCreate(
            amount=Decimal("-12345.67"),
            category=TransactionCategory.MAINTENANCE,
            description="Major maintenance expense",
            transaction_date=datetime.now(timezone.utc),
        )
        
        assert transaction.amount == Decimal("-12345.67")
        assert transaction.amount < 0
