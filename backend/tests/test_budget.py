"""Tests for Budget schemas and functionality - STORY-006."""

from decimal import Decimal
from datetime import datetime

import pytest

from app.schemas.budget import (
    BudgetItemCreate,
    BudgetCreate,
    BudgetUpdate,
    BudgetSummary,
)
from app.db.models.models import TransactionCategory


class TestBudgetSchemas:
    """Tests for STORY-006: Begroting opstellen en exporteren."""

    def test_budget_item_create_valid(self):
        """Test creating a valid budget item."""
        item = BudgetItemCreate(
            category=TransactionCategory.MAINTENANCE,
            description="Onderhoud gebouw",
            planned_amount=Decimal("5000.00"),
            notes="Jaarlijks onderhoud",
        )
        
        assert item.category == TransactionCategory.MAINTENANCE
        assert item.description == "Onderhoud gebouw"
        assert item.planned_amount == Decimal("5000.00")
        assert item.notes == "Jaarlijks onderhoud"

    def test_budget_item_create_minimal(self):
        """Test creating a budget item without optional fields."""
        item = BudgetItemCreate(
            category=TransactionCategory.ENERGY,
            description="Energie",
            planned_amount=Decimal("1200.00"),
        )
        
        assert item.category == TransactionCategory.ENERGY
        assert item.notes is None

    def test_budget_create_with_items(self):
        """Test creating a budget with multiple items."""
        items = [
            BudgetItemCreate(
                category=TransactionCategory.MAINTENANCE,
                description="Onderhoud",
                planned_amount=Decimal("5000.00"),
            ),
            BudgetItemCreate(
                category=TransactionCategory.ENERGY,
                description="Energie",
                planned_amount=Decimal("2000.00"),
            ),
            BudgetItemCreate(
                category=TransactionCategory.INSURANCE,
                description="Verzekering",
                planned_amount=Decimal("1500.00"),
            ),
        ]
        
        budget = BudgetCreate(
            year=2026,
            name="Begroting 2026",
            description="Jaarlijkse begroting",
            items=items,
        )
        
        assert budget.year == 2026
        assert budget.name == "Begroting 2026"
        assert len(budget.items) == 3
        assert budget.status == "draft"

    def test_budget_create_empty_items(self):
        """Test creating a budget without items (default empty list)."""
        budget = BudgetCreate(
            year=2026,
            name="Begroting 2026",
        )
        
        assert budget.year == 2026
        assert len(budget.items) == 0

    def test_budget_year_validation_min(self):
        """Test that budget year cannot be before 2000."""
        with pytest.raises(ValueError):
            BudgetCreate(
                year=1999,
                name="Invalid year",
            )

    def test_budget_year_validation_max(self):
        """Test that budget year cannot be after 2100."""
        with pytest.raises(ValueError):
            BudgetCreate(
                year=2101,
                name="Invalid year",
            )

    def test_budget_status_validation(self):
        """Test that budget status must be one of allowed values."""
        # Valid statuses
        for status in ["draft", "approved", "archived"]:
            budget = BudgetCreate(
                year=2026,
                name="Test",
                status=status,
            )
            assert budget.status == status
        
        # Invalid status
        with pytest.raises(ValueError):
            BudgetCreate(
                year=2026,
                name="Test",
                status="invalid",
            )

    def test_budget_update_partial(self):
        """Test partial update of budget."""
        update = BudgetUpdate(
            name="Updated naam",
        )
        
        assert update.name == "Updated naam"
        assert update.description is None
        assert update.status is None
        assert update.items is None

    def test_budget_update_full(self):
        """Test full update of budget with all fields."""
        new_items = [
            BudgetItemCreate(
                category=TransactionCategory.RESERVE,
                description="Reserve",
                planned_amount=Decimal("10000.00"),
            ),
        ]
        
        update = BudgetUpdate(
            name="Volledig bijgewerkt",
            description="Nieuwe beschrijving",
            status="approved",
            items=new_items,
        )
        
        assert update.name == "Volledig bijgewerkt"
        assert update.description == "Nieuwe beschrijving"
        assert update.status == "approved"
        assert len(update.items) == 1

    def test_budget_summary_calculation(self):
        """Test budget summary with category breakdown."""
        summary = BudgetSummary(
            total_planned=Decimal("8500.00"),
            by_category={
                "maintenance": Decimal("5000.00"),
                "energy": Decimal("2000.00"),
                "insurance": Decimal("1500.00"),
            },
            item_count=3,
        )
        
        assert summary.total_planned == Decimal("8500.00")
        assert summary.item_count == 3
        assert summary.by_category["maintenance"] == Decimal("5000.00")
        assert summary.by_category["energy"] == Decimal("2000.00")
        assert summary.by_category["insurance"] == Decimal("1500.00")

    def test_budget_item_description_not_empty(self):
        """Test that budget item description cannot be empty."""
        with pytest.raises(ValueError):
            BudgetItemCreate(
                category=TransactionCategory.OTHER,
                description="",
                planned_amount=Decimal("100.00"),
            )

    def test_budget_name_not_empty(self):
        """Test that budget name cannot be empty."""
        with pytest.raises(ValueError):
            BudgetCreate(
                year=2026,
                name="",
            )

    def test_budget_decimal_precision(self):
        """Test that budget amounts maintain proper decimal precision."""
        item = BudgetItemCreate(
            category=TransactionCategory.CONTRIBUTION,
            description="Contributie",
            planned_amount=Decimal("1234.56"),
        )
        
        assert item.planned_amount == Decimal("1234.56")
        # Ensure it's stored as Decimal, not float
        assert isinstance(item.planned_amount, Decimal)

    def test_budget_all_transaction_categories(self):
        """Test that budget items support all transaction categories."""
        for category in TransactionCategory:
            item = BudgetItemCreate(
                category=category,
                description=f"Test {category.value}",
                planned_amount=Decimal("100.00"),
            )
            assert item.category == category
