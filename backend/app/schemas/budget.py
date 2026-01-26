"""Budget schemas for STORY-006: Begroting opstellen en exporteren."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.db.models.models import TransactionCategory


class BudgetItemBase(BaseModel):
    """Base budget item schema."""

    category: TransactionCategory
    description: str = Field(..., min_length=1, max_length=255)
    planned_amount: Decimal = Field(..., decimal_places=2)
    notes: str | None = None


class BudgetItemCreate(BudgetItemBase):
    """Schema for creating a budget item."""

    pass


class BudgetItemResponse(BudgetItemBase):
    """Schema for budget item response."""

    id: uuid.UUID

    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    """Base budget schema."""

    year: int = Field(..., ge=2000, le=2100)
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    status: str = Field(default="draft", pattern="^(draft|approved|archived)$")


class BudgetCreate(BudgetBase):
    """Schema for creating a budget."""

    items: list[BudgetItemCreate] = Field(default_factory=list)


class BudgetUpdate(BaseModel):
    """Schema for updating a budget."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    status: str | None = Field(None, pattern="^(draft|approved|archived)$")
    items: list[BudgetItemCreate] | None = None


class BudgetResponse(BudgetBase):
    """Schema for budget response."""

    id: uuid.UUID
    vve_id: uuid.UUID
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    items: list[BudgetItemResponse] = []

    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    """Budget summary for financial overview."""

    total_planned: Decimal
    by_category: dict[str, Decimal]
    item_count: int
