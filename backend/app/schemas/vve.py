"""Pydantic schemas for VVE entity.

Based on architecture documentation and EPIC-009 (Multi-user toegang).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VVEBase(BaseModel):
    """Base VVE schema."""

    name: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)
    postal_code: str | None = Field(None, max_length=10)
    city: str | None = Field(None, max_length=100)
    kvk_number: str | None = Field(None, max_length=20)


class VVECreate(VVEBase):
    """Schema for creating a new VVE."""

    pass


class VVEUpdate(BaseModel):
    """Schema for updating VVE data."""

    name: str | None = Field(None, min_length=1, max_length=255)
    address: str | None = Field(None, max_length=500)
    postal_code: str | None = Field(None, max_length=10)
    city: str | None = Field(None, max_length=100)


class VVEResponse(VVEBase):
    """Schema for VVE response."""

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VVESummary(BaseModel):
    """Brief VVE summary for listings."""

    id: uuid.UUID
    name: str
    city: str | None = None
    member_count: int = 0
    unit_count: int = 0

    model_config = ConfigDict(from_attributes=True)
