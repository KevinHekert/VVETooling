"""Pydantic schemas for Contributions.

Based on FEAT-004 (Contributieberekening) and STORY-003 (Bewoner ziet eigen status).
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ContributionStatus(str, Enum):
    """Status of a contribution payment."""

    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class ContributionBase(BaseModel):
    """Base contribution schema."""

    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    amount_due: Decimal = Field(..., decimal_places=2, ge=Decimal("0"))
    due_date: datetime


class ContributionCreate(ContributionBase):
    """Schema for creating a contribution record."""

    unit_id: uuid.UUID


class ContributionResponse(ContributionBase):
    """Schema for contribution response."""

    id: uuid.UUID
    unit_id: uuid.UUID
    vve_id: uuid.UUID
    amount_paid: Decimal
    paid_at: datetime | None = None
    status: ContributionStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContributionPayment(BaseModel):
    """Schema for recording a contribution payment."""

    amount: Decimal = Field(..., decimal_places=2, ge=Decimal("0"))
    payment_date: datetime


class BewonersStatusResponse(BaseModel):
    """Schema for STORY-003: Bewoner ziet eigen status.

    Mobile-first dashboard with limited information.
    Only shows the authenticated user's own contribution status.
    """

    unit_id: uuid.UUID
    unit_number: str
    vve_name: str

    # Current month status
    current_month_due: Decimal
    current_month_paid: Decimal
    current_month_status: ContributionStatus

    # Overall status
    total_due_year: Decimal
    total_paid_year: Decimal
    outstanding_balance: Decimal

    # Recent contributions (last 3-6 months for mobile)
    recent_contributions: list[ContributionResponse] = Field(
        default_factory=list, max_length=6
    )

    # Status indicators for mobile UI
    is_up_to_date: bool
    has_overdue_payments: bool
    next_due_date: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
