"""Tests for Contract schemas and API - STORY-055.

Tests for contract registration with metadata.
"""

from datetime import datetime, timezone
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractListResponse,
    ContractSummary,
    ContractType,
    CostsPeriod,
)


class TestContractSchemas:
    """Tests for STORY-055: Contract registreren met metadata."""

    def test_contract_create_valid(self):
        """Test creating a valid contract."""
        contract = ContractCreate(
            supplier_name="Eneco",
            contract_type=ContractType.ENERGIE,
            start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
            end_date=datetime(2027, 1, 1, tzinfo=timezone.utc),
            notice_period_days=30,
            costs=Decimal("150.00"),
            costs_period=CostsPeriod.MONTHLY,
            description="Energiecontract voor algemene ruimtes",
        )

        assert contract.supplier_name == "Eneco"
        assert contract.contract_type == ContractType.ENERGIE
        assert contract.notice_period_days == 30
        assert contract.costs == Decimal("150.00")
        assert contract.costs_period == CostsPeriod.MONTHLY

    def test_contract_create_minimal(self):
        """Test creating a contract with only required fields."""
        contract = ContractCreate(
            supplier_name="OHRA",
            contract_type=ContractType.VERZEKERING,
            start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )

        assert contract.supplier_name == "OHRA"
        assert contract.contract_type == ContractType.VERZEKERING
        assert contract.end_date is None
        assert contract.notice_period_days is None
        assert contract.costs is None
        assert contract.costs_period is None
        assert contract.description is None

    def test_contract_create_supplier_name_too_short(self):
        """Test that supplier name must be at least 2 characters."""
        with pytest.raises(ValidationError) as exc_info:
            ContractCreate(
                supplier_name="A",  # Too short
                contract_type=ContractType.ONDERHOUD,
                start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
            )
        
        assert "supplier_name" in str(exc_info.value)

    def test_contract_create_invalid_contract_type(self):
        """Test that invalid contract type is rejected."""
        with pytest.raises(ValidationError):
            ContractCreate(
                supplier_name="Test Supplier",
                contract_type="invalid_type",  # type: ignore
                start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
            )

    def test_contract_create_notice_period_negative(self):
        """Test that negative notice period is rejected."""
        with pytest.raises(ValidationError):
            ContractCreate(
                supplier_name="Test Supplier",
                contract_type=ContractType.ONDERHOUD,
                start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
                notice_period_days=-1,  # Invalid: negative
            )

    def test_contract_create_notice_period_too_large(self):
        """Test that notice period over 365 days is rejected."""
        with pytest.raises(ValidationError):
            ContractCreate(
                supplier_name="Test Supplier",
                contract_type=ContractType.ONDERHOUD,
                start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
                notice_period_days=400,  # Invalid: too large
            )

    def test_contract_create_costs_negative(self):
        """Test that negative costs are rejected."""
        with pytest.raises(ValidationError):
            ContractCreate(
                supplier_name="Test Supplier",
                contract_type=ContractType.ONDERHOUD,
                start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
                costs=Decimal("-100.00"),  # Invalid: negative
            )

    def test_contract_update_partial(self):
        """Test partial contract update."""
        update = ContractUpdate(
            supplier_name="Updated Supplier",
            is_active=False,
        )

        assert update.supplier_name == "Updated Supplier"
        assert update.is_active is False
        assert update.contract_type is None
        assert update.costs is None

    def test_contract_type_enum_values(self):
        """Test all contract type enum values."""
        assert ContractType.ENERGIE.value == "energie"
        assert ContractType.VERZEKERING.value == "verzekering"
        assert ContractType.ONDERHOUD.value == "onderhoud"
        assert ContractType.OVERIG.value == "overig"

    def test_costs_period_enum_values(self):
        """Test all costs period enum values."""
        assert CostsPeriod.MONTHLY.value == "monthly"
        assert CostsPeriod.YEARLY.value == "yearly"
        assert CostsPeriod.ONE_TIME.value == "one_time"

    def test_contract_summary_structure(self):
        """Test contract summary structure."""
        summary = ContractSummary(
            total_contracts=10,
            active_contracts=8,
            expiring_soon=2,
            by_type={"energie": 3, "verzekering": 4, "onderhoud": 3},
            total_monthly_costs=Decimal("500.00"),
            total_yearly_costs=Decimal("6000.00"),
        )

        assert summary.total_contracts == 10
        assert summary.active_contracts == 8
        assert summary.expiring_soon == 2
        assert summary.by_type["energie"] == 3
        assert summary.total_monthly_costs == Decimal("500.00")
        assert summary.total_yearly_costs == Decimal("6000.00")
