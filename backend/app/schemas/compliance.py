"""Pydantic schemas for Compliance (Juridisch & Compliance).

Based on EPIC-016 (Juridisch & Compliance):
- FEAT-035: Compliance Dashboard (STORY-078, STORY-079, STORY-121)
- FEAT-036: AVG Module
- FEAT-037: Besluiten Register
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ComplianceCategory(str, Enum):
    """Compliance categories."""

    KVK = "kvk"
    VERZEKERING = "verzekering"
    AVG = "avg"
    ALV = "alv"
    ONDERHOUD = "onderhoud"
    FINANCIEEL = "financieel"
    OVERIG = "overig"


class ComplianceStatus(str, Enum):
    """Status of compliance item."""

    COMPLIANT = "compliant"
    AANDACHT = "aandacht"
    NIET_COMPLIANT = "niet_compliant"


# ============================================================================
# Compliance Item Schemas (STORY-078, STORY-079)
# ============================================================================


class ComplianceItemBase(BaseModel):
    """Base schema for compliance item."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    category: ComplianceCategory
    deadline: datetime | None = None
    alert_days_before: int = Field(30, ge=1, le=365)
    is_recurring: bool = False
    recurrence_months: int | None = Field(None, ge=1, le=60)


class ComplianceItemCreate(ComplianceItemBase):
    """Schema for creating a compliance item."""

    pass


class ComplianceItemUpdate(BaseModel):
    """Schema for updating a compliance item."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    category: ComplianceCategory | None = None
    deadline: datetime | None = None
    alert_days_before: int | None = Field(None, ge=1, le=365)
    is_recurring: bool | None = None
    recurrence_months: int | None = Field(None, ge=1, le=60)


class ComplianceItemResponse(ComplianceItemBase):
    """Response schema for compliance item."""

    id: uuid.UUID
    vve_id: uuid.UUID
    status: ComplianceStatus
    is_completed: bool
    completed_at: datetime | None = None
    completed_by_id: uuid.UUID | None = None
    completed_by_name: str | None = None
    evidence_document_id: uuid.UUID | None = None
    evidence_document_name: str | None = None
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    # Calculated fields
    days_until_deadline: int | None = None
    is_deadline_approaching: bool = False
    is_overdue: bool = False

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Compliance Completion Schemas (STORY-079)
# ============================================================================


class ComplianceCompletionRequest(BaseModel):
    """Request to mark a compliance item as complete."""

    evidence_document_id: uuid.UUID | None = None
    notes: str | None = Field(None, max_length=2000)
    completion_date: datetime | None = None  # Defaults to now if not provided


class ComplianceCompletionResponse(BaseModel):
    """Response from completing a compliance item."""

    compliance_item_id: uuid.UUID
    completed_at: datetime
    completed_by_name: str
    evidence_document_name: str | None = None
    message: str


# ============================================================================
# Compliance Dashboard Schemas (STORY-078)
# ============================================================================


class ComplianceCategorySummary(BaseModel):
    """Summary of compliance for a single category."""

    category: ComplianceCategory
    category_label: str
    total_items: int
    completed_items: int
    pending_items: int
    overdue_items: int
    status: ComplianceStatus
    compliance_percentage: float


class ComplianceDashboard(BaseModel):
    """Full compliance dashboard (STORY-078)."""

    vve_id: uuid.UUID
    overall_compliance_percentage: float
    overall_status: ComplianceStatus
    total_items: int
    completed_items: int
    pending_items: int
    overdue_items: int
    categories: list[ComplianceCategorySummary]
    upcoming_deadlines: list["ComplianceItemResponse"]


# ============================================================================
# Compliance Alert Schemas (STORY-121)
# ============================================================================


class ComplianceAlert(BaseModel):
    """Alert for approaching compliance deadline."""

    compliance_item_id: uuid.UUID
    title: str
    category: ComplianceCategory
    deadline: datetime
    days_until_deadline: int
    alert_level: str  # "info", "warning", "critical"
    action_url: str | None = None


class ComplianceAlertSettings(BaseModel):
    """Settings for compliance alerts."""

    alert_days_before: int = Field(30, ge=1, le=365)
    email_enabled: bool = True
    dashboard_enabled: bool = True


class ComplianceAlertsResponse(BaseModel):
    """Response with all active compliance alerts (STORY-121)."""

    vve_id: uuid.UUID
    total_alerts: int
    critical_count: int
    warning_count: int
    info_count: int
    alerts: list[ComplianceAlert]


# ============================================================================
# Compliance History Schemas (STORY-079)
# ============================================================================


class ComplianceHistoryEntry(BaseModel):
    """History entry for compliance item completion."""

    id: uuid.UUID
    compliance_item_id: uuid.UUID
    completed_at: datetime
    completed_by_id: uuid.UUID | None = None
    completed_by_name: str | None = None
    evidence_document_id: uuid.UUID | None = None
    evidence_document_name: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplianceHistoryResponse(BaseModel):
    """Response with compliance history."""

    compliance_item_id: uuid.UUID
    item_title: str
    entries: list[ComplianceHistoryEntry]
    total_completions: int
