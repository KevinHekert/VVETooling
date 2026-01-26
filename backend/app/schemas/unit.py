"""Pydantic schemas for Units and Splitsingssleutel.

Based on FEAT-003 (Splitsingssleutel configuratie) and STORY-002.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class UnitBase(BaseModel):
    """Base unit schema."""

    unit_number: str = Field(..., min_length=1, max_length=50)
    description: str | None = Field(None, max_length=255)
    floor: int | None = None
    area_sqm: Decimal | None = Field(None, decimal_places=2)
    share_percentage: Decimal = Field(
        ...,
        decimal_places=5,
        ge=Decimal("0"),
        le=Decimal("100"),
        description="Splitsingsaandeel als percentage (0-100)",
    )


class UnitCreate(UnitBase):
    """Schema for creating a unit."""

    pass


class UnitUpdate(BaseModel):
    """Schema for updating a unit."""

    unit_number: str | None = Field(None, min_length=1, max_length=50)
    description: str | None = Field(None, max_length=255)
    floor: int | None = None
    area_sqm: Decimal | None = Field(None, decimal_places=2)
    share_percentage: Decimal | None = Field(
        None,
        decimal_places=5,
        ge=Decimal("0"),
        le=Decimal("100"),
    )


class UnitResponse(UnitBase):
    """Schema for unit response."""

    id: uuid.UUID
    vve_id: uuid.UUID
    is_active: bool
    created_at: datetime
    owner_name: str | None = None  # Current owner's name if assigned

    model_config = ConfigDict(from_attributes=True)


class SplitsingssleutelEntry(BaseModel):
    """Single entry in splitsingssleutel configuration."""

    unit_id: uuid.UUID
    unit_number: str
    share_percentage: Decimal = Field(..., decimal_places=5)


class SplitsingssleutelValidation(BaseModel):
    """Schema for validating splitsingssleutel (STORY-002).

    The total of all share_percentage values must equal exactly 100%.
    """

    units: list[SplitsingssleutelEntry]
    total_percentage: Decimal = Field(default=Decimal("0"))
    is_valid: bool = False
    validation_message: str = ""

    @model_validator(mode="after")
    def validate_total(self) -> "SplitsingssleutelValidation":
        """Validate that shares sum to exactly 100%."""
        self.total_percentage = sum(unit.share_percentage for unit in self.units)
        if self.total_percentage == Decimal("100.00000"):
            self.is_valid = True
            self.validation_message = "Splitsingssleutel is geldig (100%)"
        else:
            self.is_valid = False
            diff = Decimal("100.00000") - self.total_percentage
            self.validation_message = (
                f"Totaal is {self.total_percentage}%, "
                f"{'voeg' if diff > 0 else 'verwijder'} "
                f"{abs(diff)}% {'toe' if diff > 0 else ''}"
            )
        return self


class SplitsingssleutelBulkUpdate(BaseModel):
    """Schema for bulk updating splitsingssleutel."""

    updates: list[SplitsingssleutelEntry]

    @model_validator(mode="after")
    def validate_total_is_100(self) -> "SplitsingssleutelBulkUpdate":
        """Ensure updates total exactly 100% before accepting."""
        total = sum(update.share_percentage for update in self.updates)
        if total != Decimal("100.00000"):
            raise ValueError(
                f"Totaal percentage moet exact 100% zijn, "
                f"huidig totaal: {total}%"
            )
        return self
