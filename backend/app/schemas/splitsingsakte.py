"""Pydantic schemas for Splitsingsakte versions.

Based on FEAT-019 (Splitsingsakte versiebeheer) and STORY-041 (Splitsingsakte versies overzicht).
Implements deed version management for VVE administration.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class SplitsingsakteVersionStatus(str, Enum):
    """Status values for splitsingsakte versions."""

    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class SplitsingsakteVersionBase(BaseModel):
    """Base schema for splitsingsakte versions."""

    name: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(None, max_length=2000)
    effective_date: datetime | None = None
    document_id: uuid.UUID | None = None


class SplitsingsakteVersionCreate(SplitsingsakteVersionBase):
    """Schema for creating a splitsingsakte version."""

    pass


class SplitsingsakteVersionUpdate(BaseModel):
    """Schema for updating a splitsingsakte version."""

    name: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = Field(None, max_length=2000)
    effective_date: datetime | None = None
    document_id: uuid.UUID | None = None


class SplitsingsakteVersionActivate(BaseModel):
    """Schema for activating a splitsingsakte version."""

    pass  # No fields needed, just the action


class SplitsingsakteVersionResponse(SplitsingsakteVersionBase):
    """Response schema for splitsingsakte version."""

    id: uuid.UUID
    vve_id: uuid.UUID
    version_number: int
    status: SplitsingsakteVersionStatus
    archived_date: datetime | None = None
    created_by_id: uuid.UUID
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    activated_by_id: uuid.UUID | None = None
    activated_by_name: str | None = None
    activated_at: datetime | None = None
    # Document details when linked
    document_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SplitsingsakteVersionListResponse(BaseModel):
    """Response schema for splitsingsakte version list item."""

    id: uuid.UUID
    vve_id: uuid.UUID
    version_number: int
    name: str
    status: SplitsingsakteVersionStatus
    effective_date: datetime | None = None
    created_at: datetime
    is_active: bool = False

    model_config = ConfigDict(from_attributes=True)
