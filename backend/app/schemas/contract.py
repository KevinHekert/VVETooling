"""Pydantic schemas for Contracts.

Based on EPIC-013 (Contractbeheer), FEAT-026 (Contractregistratie & Opslag),
and STORY-055 (Contract registreren met metadata).
Implements contract management for VVE administrators.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ContractType(str, Enum):
    """Contract type categories (STORY-055)."""

    ENERGIE = "energie"
    VERZEKERING = "verzekering"
    ONDERHOUD = "onderhoud"
    OVERIG = "overig"


class CostsPeriod(str, Enum):
    """Costs period for contracts."""

    MONTHLY = "monthly"
    YEARLY = "yearly"
    ONE_TIME = "one_time"


class ContractBase(BaseModel):
    """Base schema for contracts."""

    supplier_name: str = Field(..., min_length=2, max_length=255)
    supplier_id: uuid.UUID | None = None
    contract_type: ContractType
    description: str | None = Field(None, max_length=2000)
    start_date: datetime
    end_date: datetime | None = None
    notice_period_days: int | None = Field(None, ge=0, le=365)
    costs: Decimal | None = Field(None, ge=0, decimal_places=2)
    costs_period: CostsPeriod | None = None


class ContractCreate(ContractBase):
    """Schema for creating a contract."""

    pass


class ContractUpdate(BaseModel):
    """Schema for updating a contract."""

    supplier_name: str | None = Field(None, min_length=2, max_length=255)
    supplier_id: uuid.UUID | None = None
    contract_type: ContractType | None = None
    description: str | None = Field(None, max_length=2000)
    start_date: datetime | None = None
    end_date: datetime | None = None
    notice_period_days: int | None = Field(None, ge=0, le=365)
    costs: Decimal | None = Field(None, ge=0, decimal_places=2)
    costs_period: CostsPeriod | None = None
    is_active: bool | None = None


class ContractResponse(ContractBase):
    """Response schema for contract."""

    id: uuid.UUID
    vve_id: uuid.UUID
    document_id: uuid.UUID | None = None
    created_by_id: uuid.UUID
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ContractListResponse(BaseModel):
    """Response schema for contract list item."""

    id: uuid.UUID
    vve_id: uuid.UUID
    supplier_name: str
    contract_type: ContractType
    start_date: datetime
    end_date: datetime | None = None
    notice_period_days: int | None = None
    costs: Decimal | None = None
    costs_period: CostsPeriod | None = None
    is_active: bool
    created_at: datetime
    # Calculated fields
    days_until_end: int | None = None
    days_until_notice: int | None = None
    is_expiring_soon: bool = False

    model_config = ConfigDict(from_attributes=True)


class ContractSummary(BaseModel):
    """Summary statistics for contracts."""

    total_contracts: int
    active_contracts: int
    expiring_soon: int  # Within 30 days
    by_type: dict[str, int]
    total_monthly_costs: Decimal
    total_yearly_costs: Decimal


class ContractDocumentResponse(BaseModel):
    """Response schema for contract document upload (STORY-056)."""

    contract_id: uuid.UUID
    document_id: uuid.UUID
    file_name: str
    file_type: str
    file_size_bytes: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
