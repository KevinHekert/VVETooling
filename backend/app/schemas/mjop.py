"""Pydantic schemas for MJOP (Maintenance Plan).

Based on EPIC-014 (MJOP & Onderhoudsplanning):
- FEAT-029: MJOP Import & Beheer
- FEAT-030: Reserveberekening & Prognose
- FEAT-031: Onderhoudstaak Beheer
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MaintenanceElementCategory(str, Enum):
    """Category of maintenance element."""

    ROOF = "roof"
    FACADE = "facade"
    FOUNDATION = "foundation"
    WINDOWS = "windows"
    DOORS = "doors"
    ELEVATOR = "elevator"
    HEATING = "heating"
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    COMMON_AREAS = "common_areas"
    GARDEN = "garden"
    PARKING = "parking"
    OTHER = "other"


class MaintenanceStatus(str, Enum):
    """Status of maintenance task."""

    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    POSTPONED = "postponed"
    CANCELLED = "cancelled"


class MaintenancePriority(str, Enum):
    """Priority level for maintenance."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# ============================================================================
# MaintenanceElement Schemas (STORY-062, STORY-063)
# ============================================================================


class MaintenanceElementBase(BaseModel):
    """Base schema for maintenance element."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    category: MaintenanceElementCategory
    location: str | None = Field(None, max_length=255)
    quantity: int = Field(1, ge=1)
    unit: str | None = Field(None, max_length=50)
    installation_year: int | None = Field(None, ge=1900, le=2100)
    expected_lifespan_years: int | None = Field(None, ge=1, le=100)
    last_maintenance_year: int | None = Field(None, ge=1900, le=2100)
    next_maintenance_year: int | None = Field(None, ge=1900, le=2100)
    estimated_cost: Decimal | None = Field(None, ge=0, decimal_places=2)
    priority: MaintenancePriority = MaintenancePriority.MEDIUM


class MaintenanceElementCreate(MaintenanceElementBase):
    """Schema for creating a maintenance element (STORY-063)."""

    pass


class MaintenanceElementUpdate(BaseModel):
    """Schema for updating a maintenance element."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    category: MaintenanceElementCategory | None = None
    location: str | None = Field(None, max_length=255)
    quantity: int | None = Field(None, ge=1)
    unit: str | None = Field(None, max_length=50)
    installation_year: int | None = Field(None, ge=1900, le=2100)
    expected_lifespan_years: int | None = Field(None, ge=1, le=100)
    last_maintenance_year: int | None = Field(None, ge=1900, le=2100)
    next_maintenance_year: int | None = Field(None, ge=1900, le=2100)
    estimated_cost: Decimal | None = Field(None, ge=0, decimal_places=2)
    priority: MaintenancePriority | None = None


class MaintenanceElementResponse(MaintenanceElementBase):
    """Response schema for maintenance element."""

    id: uuid.UUID
    vve_id: uuid.UUID
    import_batch_id: uuid.UUID | None = None
    import_row_number: int | None = None
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# MaintenanceTask Schemas (STORY-067, STORY-068)
# ============================================================================


class MaintenanceTaskBase(BaseModel):
    """Base schema for maintenance task."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    status: MaintenanceStatus = MaintenanceStatus.PLANNED
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    planned_year: int | None = Field(None, ge=1900, le=2100)
    planned_date: datetime | None = None
    estimated_cost: Decimal | None = Field(None, ge=0, decimal_places=2)
    notes: str | None = None


class MaintenanceTaskCreate(MaintenanceTaskBase):
    """Schema for creating a maintenance task (STORY-067)."""

    element_id: uuid.UUID
    assignee_id: uuid.UUID | None = None
    supplier_id: uuid.UUID | None = None


class MaintenanceTaskUpdate(BaseModel):
    """Schema for updating a maintenance task (STORY-068)."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    status: MaintenanceStatus | None = None
    priority: MaintenancePriority | None = None
    planned_year: int | None = Field(None, ge=1900, le=2100)
    planned_date: datetime | None = None
    completed_date: datetime | None = None
    estimated_cost: Decimal | None = Field(None, ge=0, decimal_places=2)
    actual_cost: Decimal | None = Field(None, ge=0, decimal_places=2)
    assignee_id: uuid.UUID | None = None
    supplier_id: uuid.UUID | None = None
    notes: str | None = None


class MaintenanceTaskResponse(MaintenanceTaskBase):
    """Response schema for maintenance task."""

    id: uuid.UUID
    element_id: uuid.UUID
    vve_id: uuid.UUID
    completed_date: datetime | None = None
    actual_cost: Decimal | None = None
    assignee_id: uuid.UUID | None = None
    supplier_id: uuid.UUID | None = None
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# MJOP Import Schemas (STORY-062)
# ============================================================================


class ColumnMapping(BaseModel):
    """Column mapping for Excel import."""

    name: str  # Name of target field
    excel_column: str | None = None  # Excel column letter or name


class MJOPImportPreviewRow(BaseModel):
    """Preview of a single row from Excel import."""

    row_number: int
    data: dict[str, Any]
    errors: list[str] = Field(default_factory=list)
    is_valid: bool = True


class MJOPImportPreviewRequest(BaseModel):
    """Request to preview Excel import with column mapping."""

    column_mapping: dict[str, str]  # target_field -> excel_column


class MJOPImportPreviewResponse(BaseModel):
    """Response with preview of import data (STORY-062)."""

    filename: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    preview_rows: list[MJOPImportPreviewRow]
    detected_columns: list[str]
    suggested_mapping: dict[str, str]


class MJOPImportRequest(BaseModel):
    """Request to confirm and execute MJOP import (STORY-062)."""

    column_mapping: dict[str, str]  # target_field -> excel_column
    skip_invalid_rows: bool = False


class MJOPImportResponse(BaseModel):
    """Response after completing MJOP import (STORY-062)."""

    batch_id: uuid.UUID
    filename: str
    total_rows: int
    imported_rows: int
    failed_rows: int
    errors: list[dict[str, Any]] = Field(default_factory=list)


class MJOPImportBatchResponse(BaseModel):
    """Response schema for import batch."""

    id: uuid.UUID
    vve_id: uuid.UUID
    filename: str
    total_rows: int
    imported_rows: int
    failed_rows: int
    is_completed: bool
    created_by_id: uuid.UUID | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Timeline / Visualization Schemas (STORY-064)
# ============================================================================


class TimelineItem(BaseModel):
    """Item in MJOP timeline visualization."""

    element_id: uuid.UUID
    element_name: str
    category: MaintenanceElementCategory
    year: int
    estimated_cost: Decimal | None = None
    priority: MaintenancePriority
    has_task: bool = False
    task_status: MaintenanceStatus | None = None


class MJOPTimelineResponse(BaseModel):
    """Timeline visualization data (STORY-064)."""

    vve_id: uuid.UUID
    start_year: int
    end_year: int
    items: list[TimelineItem]
    total_by_year: dict[int, Decimal]
    total_by_category: dict[str, Decimal]


# ============================================================================
# Reserve Calculation Schemas (STORY-065, STORY-066)
# ============================================================================


class ReserveCalculationRequest(BaseModel):
    """Request for automatic reserve calculation (STORY-065)."""

    years_ahead: int = Field(10, ge=1, le=50)
    include_contingency: bool = True
    contingency_percentage: Decimal = Field(Decimal("10.0"), ge=0, le=50)


class ReserveCalculationResponse(BaseModel):
    """Response with reserve calculation (STORY-065)."""

    vve_id: uuid.UUID
    years_ahead: int
    total_required: Decimal
    annual_contribution: Decimal
    by_year: dict[int, Decimal]
    by_category: dict[str, Decimal]
    contingency_amount: Decimal | None = None


class WhatIfScenarioRequest(BaseModel):
    """Request for what-if scenario calculation (STORY-066).
    
    Allows penningmeester to adjust contribution per owner and see
    impact on reserve projections for ALV presentation.
    """

    name: str = Field(..., min_length=1, max_length=255, description="Scenario name for saving/presentation")
    years_ahead: int = Field(10, ge=1, le=50, description="Number of years to project")
    contribution_adjustment_percentage: Decimal = Field(
        Decimal("0.0"), ge=-50, le=100,
        description="Percentage adjustment to contributions (e.g., 10 = +10%)"
    )
    postpone_elements: list[uuid.UUID] = Field(
        default_factory=list,
        description="Elements to postpone maintenance for"
    )
    postpone_years: int = Field(1, ge=1, le=10, description="Years to postpone selected elements")
    cost_increase_percentage: Decimal = Field(
        Decimal("0.0"), ge=-50, le=100,
        description="Assumed cost increase/decrease percentage"
    )
    include_contingency: bool = Field(True, description="Include contingency reserve")
    contingency_percentage: Decimal = Field(Decimal("10.0"), ge=0, le=50)


class WhatIfYearProjection(BaseModel):
    """Yearly projection data for what-if scenario (STORY-066)."""

    year: int
    original_cost: Decimal
    scenario_cost: Decimal
    original_contribution: Decimal
    scenario_contribution: Decimal
    original_reserve_balance: Decimal
    scenario_reserve_balance: Decimal


class WhatIfScenarioResponse(BaseModel):
    """Response with what-if scenario calculation (STORY-066).
    
    Provides comparison between current vs scenario projections,
    with yearly breakdown for graphing.
    """

    scenario_name: str
    years_ahead: int
    original_total: Decimal
    scenario_total: Decimal
    difference: Decimal
    difference_percentage: Decimal
    annual_contribution_original: Decimal
    annual_contribution_scenario: Decimal
    yearly_projections: list[WhatIfYearProjection]
    by_category_original: dict[str, Decimal]
    by_category_scenario: dict[str, Decimal]
    warnings: list[str] = Field(default_factory=list)


class SavedScenario(BaseModel):
    """Saved scenario for later retrieval (STORY-066)."""

    id: uuid.UUID
    vve_id: uuid.UUID
    name: str
    parameters: WhatIfScenarioRequest
    created_at: datetime
    created_by_id: uuid.UUID | None = None

    model_config = ConfigDict(from_attributes=True)
