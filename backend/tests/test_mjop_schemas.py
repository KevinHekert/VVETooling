"""Tests for MJOP (Maintenance Plan) schemas - EPIC-014.

Tests for:
- FEAT-029: MJOP Import & Beheer (STORY-062, STORY-063, STORY-064)
- FEAT-030: Reserveberekening & Prognose (STORY-065, STORY-066)
- FEAT-031: Onderhoudstaak Beheer (STORY-067, STORY-068)
"""

import uuid
from decimal import Decimal

import pytest

from app.schemas.mjop import (
    MaintenanceElementCategory,
    MaintenanceElementCreate,
    MaintenanceElementUpdate,
    MaintenanceElementResponse,
    MaintenancePriority,
    MaintenanceStatus,
    MaintenanceTaskCreate,
    MaintenanceTaskUpdate,
    MJOPImportPreviewRow,
    TimelineItem,
    ReserveCalculationRequest,
    WhatIfScenario,
)


class TestMaintenanceElementSchemas:
    """Tests for STORY-062 and STORY-063: MaintenanceElement schemas."""

    def test_create_element_with_all_fields(self):
        """Test creating a maintenance element with all fields."""
        element = MaintenanceElementCreate(
            name="Dakbedekking",
            description="Bitumen dakbedekking plat dak",
            category=MaintenanceElementCategory.ROOF,
            location="Hoofdgebouw",
            quantity=1,
            unit="m²",
            installation_year=2010,
            expected_lifespan_years=25,
            last_maintenance_year=2020,
            next_maintenance_year=2030,
            estimated_cost=Decimal("15000.00"),
            priority=MaintenancePriority.HIGH,
        )

        assert element.name == "Dakbedekking"
        assert element.category == MaintenanceElementCategory.ROOF
        assert element.estimated_cost == Decimal("15000.00")
        assert element.priority == MaintenancePriority.HIGH

    def test_create_element_with_minimal_fields(self):
        """Test creating a maintenance element with only required fields."""
        element = MaintenanceElementCreate(
            name="Lift",
            category=MaintenanceElementCategory.ELEVATOR,
        )

        assert element.name == "Lift"
        assert element.category == MaintenanceElementCategory.ELEVATOR
        assert element.quantity == 1  # Default value
        assert element.priority == MaintenancePriority.MEDIUM  # Default value

    def test_element_name_validation(self):
        """Test that empty name is rejected."""
        with pytest.raises(ValueError):
            MaintenanceElementCreate(
                name="",  # Empty name should fail
                category=MaintenanceElementCategory.OTHER,
            )

    def test_element_year_validation(self):
        """Test year field validation bounds."""
        with pytest.raises(ValueError):
            MaintenanceElementCreate(
                name="Test",
                category=MaintenanceElementCategory.OTHER,
                installation_year=1800,  # Too early
            )

        with pytest.raises(ValueError):
            MaintenanceElementCreate(
                name="Test",
                category=MaintenanceElementCategory.OTHER,
                installation_year=2200,  # Too far in future
            )

    def test_element_cost_validation(self):
        """Test that negative costs are rejected."""
        with pytest.raises(ValueError):
            MaintenanceElementCreate(
                name="Test",
                category=MaintenanceElementCategory.OTHER,
                estimated_cost=Decimal("-1000.00"),
            )

    def test_update_element_partial(self):
        """Test partial update of maintenance element."""
        update = MaintenanceElementUpdate(
            estimated_cost=Decimal("20000.00"),
            next_maintenance_year=2028,
        )

        assert update.estimated_cost == Decimal("20000.00")
        assert update.next_maintenance_year == 2028
        assert update.name is None  # Not updated
        assert update.category is None  # Not updated


class TestMaintenanceTaskSchemas:
    """Tests for STORY-067 and STORY-068: MaintenanceTask schemas."""

    def test_create_task_with_all_fields(self):
        """Test creating a maintenance task with all fields."""
        element_id = uuid.uuid4()
        assignee_id = uuid.uuid4()

        task = MaintenanceTaskCreate(
            title="Dakbedekking vervangen",
            description="Volledige vervanging bitumen dakbedekking",
            element_id=element_id,
            status=MaintenanceStatus.PLANNED,
            priority=MaintenancePriority.HIGH,
            planned_year=2030,
            estimated_cost=Decimal("15000.00"),
            assignee_id=assignee_id,
            notes="Offerte aangevraagd bij 3 leveranciers",
        )

        assert task.title == "Dakbedekking vervangen"
        assert task.element_id == element_id
        assert task.status == MaintenanceStatus.PLANNED
        assert task.priority == MaintenancePriority.HIGH

    def test_create_task_with_minimal_fields(self):
        """Test creating a task with only required fields."""
        element_id = uuid.uuid4()

        task = MaintenanceTaskCreate(
            title="Lift onderhoud",
            element_id=element_id,
        )

        assert task.title == "Lift onderhoud"
        assert task.element_id == element_id
        assert task.status == MaintenanceStatus.PLANNED  # Default
        assert task.priority == MaintenancePriority.MEDIUM  # Default

    def test_update_task_status(self):
        """Test updating task status (STORY-068)."""
        update = MaintenanceTaskUpdate(
            status=MaintenanceStatus.IN_PROGRESS,
            actual_cost=Decimal("14500.00"),
        )

        assert update.status == MaintenanceStatus.IN_PROGRESS
        assert update.actual_cost == Decimal("14500.00")


class TestMJOPImportSchemas:
    """Tests for STORY-062: MJOP import schemas."""

    def test_import_preview_row_valid(self):
        """Test creating a valid import preview row."""
        row = MJOPImportPreviewRow(
            row_number=2,
            data={"naam": "Dakbedekking", "categorie": "dak", "kosten": "15000"},
            errors=[],
            is_valid=True,
        )

        assert row.row_number == 2
        assert row.is_valid is True
        assert len(row.errors) == 0

    def test_import_preview_row_with_errors(self):
        """Test creating a preview row with validation errors."""
        row = MJOPImportPreviewRow(
            row_number=5,
            data={"naam": "", "categorie": "onbekend"},
            errors=["Verplicht veld 'naam' ontbreekt", "Onbekende categorie: onbekend"],
            is_valid=False,
        )

        assert row.row_number == 5
        assert row.is_valid is False
        assert len(row.errors) == 2


class TestTimelineSchemas:
    """Tests for STORY-064: MJOP timeline visualization."""

    def test_timeline_item_creation(self):
        """Test creating a timeline item."""
        element_id = uuid.uuid4()

        item = TimelineItem(
            element_id=element_id,
            element_name="Dakbedekking",
            category=MaintenanceElementCategory.ROOF,
            year=2030,
            estimated_cost=Decimal("15000.00"),
            priority=MaintenancePriority.HIGH,
            has_task=True,
            task_status=MaintenanceStatus.PLANNED,
        )

        assert item.element_id == element_id
        assert item.year == 2030
        assert item.has_task is True
        assert item.task_status == MaintenanceStatus.PLANNED


class TestReserveCalculationSchemas:
    """Tests for STORY-065 and STORY-066: Reserve calculation."""

    def test_reserve_calculation_request_defaults(self):
        """Test default values for reserve calculation request."""
        request = ReserveCalculationRequest()

        assert request.years_ahead == 10
        assert request.include_contingency is True
        assert request.contingency_percentage == Decimal("10.0")

    def test_reserve_calculation_request_custom(self):
        """Test custom values for reserve calculation request."""
        request = ReserveCalculationRequest(
            years_ahead=20,
            include_contingency=False,
            contingency_percentage=Decimal("15.0"),
        )

        assert request.years_ahead == 20
        assert request.include_contingency is False
        assert request.contingency_percentage == Decimal("15.0")

    def test_reserve_calculation_years_validation(self):
        """Test validation of years_ahead bounds."""
        with pytest.raises(ValueError):
            ReserveCalculationRequest(years_ahead=0)

        with pytest.raises(ValueError):
            ReserveCalculationRequest(years_ahead=60)

    def test_whatif_scenario(self):
        """Test what-if scenario creation (STORY-066)."""
        element_ids = [uuid.uuid4(), uuid.uuid4()]

        scenario = WhatIfScenario(
            name="Uitstel dakonderhoud",
            postpone_elements=element_ids,
            postpone_years=2,
            cost_increase_percentage=Decimal("5.0"),
        )

        assert scenario.name == "Uitstel dakonderhoud"
        assert len(scenario.postpone_elements) == 2
        assert scenario.postpone_years == 2


class TestCategoryEnums:
    """Tests for maintenance category enumerations."""

    def test_all_categories_have_values(self):
        """Test that all categories have string values."""
        for category in MaintenanceElementCategory:
            assert isinstance(category.value, str)
            assert len(category.value) > 0

    def test_roof_category_value(self):
        """Test specific category value."""
        assert MaintenanceElementCategory.ROOF.value == "roof"

    def test_status_enum_values(self):
        """Test maintenance status enumeration."""
        assert MaintenanceStatus.PLANNED.value == "planned"
        assert MaintenanceStatus.IN_PROGRESS.value == "in_progress"
        assert MaintenanceStatus.COMPLETED.value == "completed"

    def test_priority_enum_values(self):
        """Test priority enumeration."""
        assert MaintenancePriority.LOW.value == "low"
        assert MaintenancePriority.MEDIUM.value == "medium"
        assert MaintenancePriority.HIGH.value == "high"
        assert MaintenancePriority.URGENT.value == "urgent"
