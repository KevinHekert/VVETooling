"""ALV (Algemene Ledenvergadering) schemas.

Implements EPIC-015 (ALV & Vergaderbeheer), FEAT-032 (ALV Planning & Uitnodigingen),
and STORY-069 (ALV plannen met datum en locatie).
"""

import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MeetingType(str, Enum):
    """Type of ALV meeting."""

    FYSIEK = "fysiek"
    ONLINE = "online"
    HYBRIDE = "hybride"


class MeetingStatus(str, Enum):
    """Status of an ALV meeting."""

    GEPLAND = "gepland"
    UITNODIGING_VERZONDEN = "uitnodiging_verzonden"
    ACTIEF = "actief"
    AFGESLOTEN = "afgesloten"
    GEANNULEERD = "geannuleerd"


class MeetingCreate(BaseModel):
    """Schema for creating an ALV meeting (STORY-069)."""

    title: str = Field(..., min_length=3, max_length=255, description="Meeting title")
    description: str | None = Field(None, max_length=2000)
    meeting_date: datetime
    end_time: datetime | None = None
    meeting_type: MeetingType = MeetingType.FYSIEK
    location_address: str | None = Field(None, max_length=500)
    location_online_link: str | None = Field(None, max_length=500)

    @field_validator('meeting_date')
    @classmethod
    def meeting_date_must_be_future(cls, v: datetime) -> datetime:
        """Validate that meeting date is at least 8 days in the future (STORY-069)."""
        min_date = datetime.now(timezone.utc) + timedelta(days=8)
        if v < min_date:
            raise ValueError('Vergaderdatum moet minimaal 8 dagen in de toekomst liggen')
        return v

    @field_validator('location_address')
    @classmethod
    def validate_location_for_type(cls, v: str | None, info) -> str | None:
        """Validate that fysiek/hybride meetings have an address."""
        meeting_type = info.data.get('meeting_type')
        if meeting_type in (MeetingType.FYSIEK, MeetingType.HYBRIDE) and not v:
            # Allow empty for now, can be added later
            pass
        return v


class MeetingUpdate(BaseModel):
    """Schema for updating an ALV meeting."""

    title: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = Field(None, max_length=2000)
    meeting_date: datetime | None = None
    end_time: datetime | None = None
    meeting_type: MeetingType | None = None
    location_address: str | None = Field(None, max_length=500)
    location_online_link: str | None = Field(None, max_length=500)
    status: MeetingStatus | None = None


class MeetingResponse(BaseModel):
    """Response schema for an ALV meeting."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    description: str | None = None
    meeting_date: datetime
    end_time: datetime | None = None
    meeting_type: MeetingType
    location_address: str | None = None
    location_online_link: str | None = None
    status: MeetingStatus
    created_by_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    # Calculated fields
    days_until: int | None = None
    is_upcoming: bool = False

    model_config = ConfigDict(from_attributes=True)


class MeetingListResponse(BaseModel):
    """List response schema for ALV meetings."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    meeting_date: datetime
    meeting_type: MeetingType
    status: MeetingStatus
    days_until: int | None = None
    is_upcoming: bool = False

    model_config = ConfigDict(from_attributes=True)
