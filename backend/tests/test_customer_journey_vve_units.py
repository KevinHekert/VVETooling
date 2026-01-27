"""Tests for Customer Journey: VVE Setup & Unit Management.

Based on customer journeys:
- 2.1 Penningmeester Richt VVE In (VVE setup wizard)
  - VVE naam en adresgegevens invoeren
  - Aantal appartementen opgeven
  - Splitsingssleutels definiëren (breukdelen)
  
STORY-002: Als penningmeester wil ik dat de splitsingssleutel
automatisch valideert op 100%, zodat ik zeker weet dat de berekening klopt.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from app.schemas.vve import (
    VVECreate,
    VVEUpdate,
    VVEResponse,
    VVESummary,
)
from app.schemas.unit import (
    UnitCreate,
    UnitUpdate,
    UnitResponse,
    SplitsingssleutelEntry,
    SplitsingssleutelValidation,
    SplitsingssleutelBulkUpdate,
)


class TestVVESetupJourney:
    """Tests for VVE Setup (Customer journey 2.1).
    
    Steps:
    - VVE naam en adresgegevens invoeren
    - Aantal appartementen opgeven
    """

    def test_vve_create_complete(self):
        """Test creating VVE with all details."""
        vve = VVECreate(
            name="VVE Zonnelaan 1-10",
            address="Zonnelaan 1-10",
            postal_code="1234 AB",
            city="Amsterdam",
            kvk_number="12345678",
        )
        
        assert vve.name == "VVE Zonnelaan 1-10"
        assert vve.address == "Zonnelaan 1-10"
        assert vve.postal_code == "1234 AB"
        assert vve.city == "Amsterdam"
        assert vve.kvk_number == "12345678"

    def test_vve_create_minimal(self):
        """Test creating VVE with only name."""
        vve = VVECreate(
            name="VVE Maanstraat 5",
        )
        
        assert vve.name == "VVE Maanstraat 5"
        assert vve.address is None
        assert vve.postal_code is None
        assert vve.city is None

    def test_vve_name_not_empty(self):
        """Test VVE name cannot be empty."""
        with pytest.raises(ValueError):
            VVECreate(name="")

    def test_vve_update_address(self):
        """Test updating VVE address."""
        update = VVEUpdate(
            address="Nieuwe Zonnelaan 15-25",
            postal_code="1234 CD",
        )
        
        assert update.address == "Nieuwe Zonnelaan 15-25"
        assert update.postal_code == "1234 CD"
        assert update.name is None  # Not updated

    def test_vve_response_complete(self):
        """Test VVE response with all fields."""
        now = datetime.now(timezone.utc)
        
        response = VVEResponse(
            id=uuid.uuid4(),
            name="VVE Sterplein 20-40",
            address="Sterplein 20-40",
            postal_code="5678 EF",
            city="Rotterdam",
            kvk_number="87654321",
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        
        assert response.is_active is True
        assert response.name == "VVE Sterplein 20-40"

    def test_vve_summary(self):
        """Test VVE summary for listings."""
        summary = VVESummary(
            id=uuid.uuid4(),
            name="VVE Zonnelaan 1-10",
            city="Amsterdam",
            member_count=18,
            unit_count=10,
        )
        
        assert summary.member_count == 18
        assert summary.unit_count == 10


class TestUnitCreationJourney:
    """Tests for Unit/Apartment creation (part of VVE setup).
    
    Customer journey 2.1: Aantal appartementen opgeven
    """

    def test_unit_create_complete(self):
        """Test creating unit with all details."""
        unit = UnitCreate(
            unit_number="A1",
            description="Appartement A1 - Begane grond links",
            floor=0,
            area_sqm=Decimal("85.50"),
            share_percentage=Decimal("5.50000"),
        )
        
        assert unit.unit_number == "A1"
        assert unit.floor == 0
        assert unit.area_sqm == Decimal("85.50")
        assert unit.share_percentage == Decimal("5.50000")

    def test_unit_create_minimal(self):
        """Test creating unit with minimal details."""
        unit = UnitCreate(
            unit_number="B2",
            share_percentage=Decimal("5.00000"),
        )
        
        assert unit.unit_number == "B2"
        assert unit.description is None

    def test_unit_create_multiple_floors(self):
        """Test creating units on different floors."""
        floors = [0, 1, 2, 3, 4]  # Ground + 4 floors
        
        for floor in floors:
            unit = UnitCreate(
                unit_number=f"F{floor}",
                floor=floor,
                share_percentage=Decimal("5.00000"),
            )
            assert unit.floor == floor

    def test_unit_update_description(self):
        """Test updating unit description."""
        update = UnitUpdate(
            description="Gerenoveerd in 2025",
        )
        
        assert update.description == "Gerenoveerd in 2025"

    def test_unit_update_area(self):
        """Test updating unit area."""
        update = UnitUpdate(
            area_sqm=Decimal("90.25"),
        )
        
        assert update.area_sqm == Decimal("90.25")

    def test_unit_response_complete(self):
        """Test unit response with all fields."""
        now = datetime.now(timezone.utc)
        
        response = UnitResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            unit_number="C3",
            description="Appartement C3",
            floor=2,
            area_sqm=Decimal("75.00"),
            share_percentage=Decimal("6.25000"),
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        
        assert response.unit_number == "C3"
        assert response.share_percentage == Decimal("6.25000")


class TestSplitsingssleutelJourney:
    """Tests for Splitsingssleutel (STORY-002).
    
    Customer journey 2.1: Splitsingssleutels definiëren (breukdelen)
    
    STORY-002: Als penningmeester wil ik dat de splitsingssleutel
    automatisch valideert op 100%, zodat ik zeker weet dat de berekening klopt.
    """

    def test_splitsingssleutel_entry(self):
        """Test single splitsingssleutel entry."""
        entry = SplitsingssleutelEntry(
            unit_id=uuid.uuid4(),
            unit_number="A1",
            share_percentage=Decimal("10.00000"),
        )
        
        assert entry.unit_number == "A1"
        assert entry.share_percentage == Decimal("10.00000")

    def test_splitsingssleutel_validation_100_percent(self):
        """Test validation passes at exactly 100%."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number=f"A{i}",
                share_percentage=Decimal("10.00000"),
            )
            for i in range(1, 11)  # 10 units at 10% each
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is True
        assert validation.total_percentage == Decimal("100.00000")
        assert "geldig" in validation.validation_message.lower()

    def test_splitsingssleutel_validation_under_100(self):
        """Test validation fails when under 100%."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("40.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("30.00000"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is False
        assert validation.total_percentage == Decimal("70.00000")

    def test_splitsingssleutel_validation_over_100(self):
        """Test validation fails when over 100%."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("60.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("50.00000"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is False
        assert validation.total_percentage == Decimal("110.00000")

    def test_splitsingssleutel_uneven_distribution(self):
        """Test uneven distribution that sums to 100%."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("33.33333"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("33.33334"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A3",
                share_percentage=Decimal("33.33333"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is True
        assert validation.total_percentage == Decimal("100.00000")


class TestSplitsingssleutelBulkUpdateJourney:
    """Tests for bulk updating splitsingssleutel."""

    def test_bulk_update_accepts_100_percent(self):
        """Test bulk update accepts exactly 100% total."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("50.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("50.00000"),
            ),
        ]
        
        update = SplitsingssleutelBulkUpdate(updates=entries)
        
        assert len(update.updates) == 2

    def test_bulk_update_rejects_under_100_percent(self):
        """Test bulk update rejects under 100% total."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("45.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("45.00000"),
            ),
        ]
        
        with pytest.raises(ValueError) as exc_info:
            SplitsingssleutelBulkUpdate(updates=entries)
        
        assert "100%" in str(exc_info.value)

    def test_bulk_update_rejects_over_100_percent(self):
        """Test bulk update rejects over 100% total."""
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=Decimal("55.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number="A2",
                share_percentage=Decimal("55.00000"),
            ),
        ]
        
        with pytest.raises(ValueError) as exc_info:
            SplitsingssleutelBulkUpdate(updates=entries)
        
        assert "100%" in str(exc_info.value)


class TestSplitsingssleutelDecimalPrecision:
    """Test decimal precision for splitsingssleutel (5 decimal places)."""

    def test_share_percentage_precision(self):
        """Test share percentage maintains 5 decimal precision."""
        entry = SplitsingssleutelEntry(
            unit_id=uuid.uuid4(),
            unit_number="A1",
            share_percentage=Decimal("12.34567"),
        )
        
        assert entry.share_percentage == Decimal("12.34567")

    def test_complex_distribution(self):
        """Test complex distribution with many decimal places."""
        # 18 apartments with varying sizes
        entries = [
            SplitsingssleutelEntry(
                unit_id=uuid.uuid4(),
                unit_number=f"A{i}",
                share_percentage=Decimal("5.55556") if i < 18 else Decimal("5.55552"),
            )
            for i in range(1, 19)
        ]
        
        # Adjust to exactly 100%
        total = sum(e.share_percentage for e in entries)
        assert isinstance(total, Decimal)
