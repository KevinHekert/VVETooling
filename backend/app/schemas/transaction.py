"""Pydantic schemas for Transactions.

Based on FEAT-001 (Transactiebeheer) and STORY-001 (Transactie toevoegen).
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TransactionCategory(str, Enum):
    """Transaction categories."""

    CONTRIBUTION = "contribution"
    MAINTENANCE = "maintenance"
    ENERGY = "energy"
    INSURANCE = "insurance"
    ADMINISTRATIVE = "administrative"
    RESERVE = "reserve"
    OTHER = "other"


class TransactionBase(BaseModel):
    """Base transaction schema."""

    amount: Decimal = Field(..., decimal_places=2, description="Transaction amount")
    category: TransactionCategory
    description: str | None = Field(None, max_length=1000)
    transaction_date: datetime
    reserve_fund_id: uuid.UUID | None = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction (STORY-001)."""

    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""

    amount: Decimal | None = Field(None, decimal_places=2)
    category: TransactionCategory | None = None
    description: str | None = Field(None, max_length=1000)
    transaction_date: datetime | None = None
    reserve_fund_id: uuid.UUID | None = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""

    id: uuid.UUID
    vve_id: uuid.UUID
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionSummary(BaseModel):
    """Summary of transactions for overview."""

    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    transaction_count: int
    by_category: dict[str, Decimal]
