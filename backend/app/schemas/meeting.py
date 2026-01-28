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


# STORY-070: Agenda Item schemas
class AgendaItemCreate(BaseModel):
    """Schema for creating an agenda item (STORY-070)."""

    title: str = Field(..., min_length=2, max_length=255, description="Agenda item title")
    description: str | None = Field(None, max_length=2000)
    duration_minutes: int | None = Field(None, ge=1, le=480, description="Duration in minutes")
    order_index: int = Field(0, ge=0, description="Order in the agenda")
    document_id: uuid.UUID | None = None
    is_standard: bool = False


class AgendaItemUpdate(BaseModel):
    """Schema for updating an agenda item (STORY-070)."""

    title: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = Field(None, max_length=2000)
    duration_minutes: int | None = Field(None, ge=1, le=480)
    order_index: int | None = Field(None, ge=0)
    document_id: uuid.UUID | None = None


class AgendaItemResponse(BaseModel):
    """Response schema for an agenda item (STORY-070)."""

    id: uuid.UUID
    meeting_id: uuid.UUID
    title: str
    description: str | None = None
    duration_minutes: int | None = None
    order_index: int
    document_id: uuid.UUID | None = None
    document_name: str | None = None
    is_standard: bool
    created_by_id: uuid.UUID
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgendaItemReorder(BaseModel):
    """Schema for reordering agenda items (STORY-070)."""

    item_ids: list[uuid.UUID] = Field(..., description="List of agenda item IDs in new order")


# Standard agenda items template (STORY-070)
STANDARD_AGENDA_TEMPLATE = [
    {"title": "Opening", "duration_minutes": 5, "is_standard": True},
    {"title": "Vaststelling notulen vorige ALV", "duration_minutes": 10, "is_standard": True},
    {"title": "Jaarverslag bestuur", "duration_minutes": 15, "is_standard": True},
    {"title": "Jaarrekening", "duration_minutes": 20, "is_standard": True},
    {"title": "Begroting volgend jaar", "duration_minutes": 20, "is_standard": True},
    {"title": "Rondvraag", "duration_minutes": 15, "is_standard": True},
    {"title": "Sluiting", "duration_minutes": 5, "is_standard": True},
]


# STORY-071: ALV Invitation schemas
class MeetingInvitationCreate(BaseModel):
    """Schema for sending ALV invitations (STORY-071)."""

    include_agenda: bool = Field(True, description="Include agenda in invitation")
    include_documents: bool = Field(False, description="Include document links")
    custom_message: str | None = Field(None, max_length=2000, description="Optional custom message")


class MeetingInvitationResponse(BaseModel):
    """Response schema for invitation sending (STORY-071)."""

    meeting_id: uuid.UUID
    invitations_sent: int
    status: str
    sent_at: datetime
    recipients: list[str] = []


class MeetingInvitationPreview(BaseModel):
    """Preview of ALV invitation email (STORY-071)."""

    subject: str
    body_preview: str
    recipient_count: int
    meeting_date: datetime
    agenda_summary: str | None = None
    document_count: int = 0


# STORY-072: RSVP schemas
class RsvpStatus(str, Enum):
    """RSVP status options (STORY-072)."""

    PRESENT = "present"  # Aanwezig
    ABSENT = "absent"  # Afwezig
    WITH_PROXY = "with_proxy"  # Met volmacht


class RsvpCreate(BaseModel):
    """Schema for creating/updating an RSVP (STORY-072)."""

    status: RsvpStatus
    proxy_holder_name: str | None = Field(None, max_length=255)
    notes: str | None = Field(None, max_length=500)

    @field_validator('proxy_holder_name')
    @classmethod
    def validate_proxy_holder(cls, v: str | None, info) -> str | None:
        """Validate proxy holder is provided when status is WITH_PROXY."""
        status = info.data.get('status')
        if status == RsvpStatus.WITH_PROXY and not v:
            raise ValueError('Volmachthouder is verplicht bij status "met volmacht"')
        return v


class RsvpResponse(BaseModel):
    """Response schema for RSVP (STORY-072)."""

    id: uuid.UUID
    meeting_id: uuid.UUID
    user_id: uuid.UUID
    user_name: str | None = None
    status: RsvpStatus
    proxy_holder_name: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RsvpSummary(BaseModel):
    """Summary of RSVPs for a meeting (STORY-072)."""

    meeting_id: uuid.UUID
    total_invited: int
    total_responded: int
    present_count: int
    absent_count: int
    with_proxy_count: int
    no_response_count: int
    response_rate: float


# STORY-073: Proxy (Volmacht) schemas
class ProxyScope(str, Enum):
    """Scope of the proxy - full or specific agenda items (STORY-073)."""

    FULL = "full"  # Volmacht voor alle agendapunten
    SPECIFIC = "specific"  # Volmacht voor specifieke agendapunten


class ProxyStatus(str, Enum):
    """Status of a proxy/volmacht (STORY-073)."""

    PENDING = "pending"  # Wachtend op bevestiging
    CONFIRMED = "confirmed"  # Bevestigd door gevolmachtigde
    REVOKED = "revoked"  # Ingetrokken door volmachtgever


class ProxyCreate(BaseModel):
    """Schema for creating a digital proxy/volmacht (STORY-073)."""

    grantee_id: uuid.UUID = Field(..., description="ID of the person receiving the proxy")
    scope: ProxyScope = Field(ProxyScope.FULL, description="Scope of the proxy")
    agenda_item_ids: list[uuid.UUID] | None = Field(
        None, description="Specific agenda item IDs (required if scope is SPECIFIC)"
    )
    notes: str | None = Field(None, max_length=500, description="Optional notes from grantor")

    @field_validator('agenda_item_ids')
    @classmethod
    def validate_agenda_items_for_scope(cls, v: list[uuid.UUID] | None, info) -> list[uuid.UUID] | None:
        """Validate that agenda_item_ids is provided when scope is SPECIFIC."""
        scope = info.data.get('scope')
        if scope == ProxyScope.SPECIFIC and (not v or len(v) == 0):
            raise ValueError('Agendapunten zijn verplicht bij beperkte volmacht')
        return v


class ProxyUpdate(BaseModel):
    """Schema for updating a proxy status (STORY-073)."""

    status: ProxyStatus | None = None
    notes: str | None = Field(None, max_length=500)


class ProxyResponse(BaseModel):
    """Response schema for a proxy/volmacht (STORY-073)."""

    id: uuid.UUID
    meeting_id: uuid.UUID
    grantor_id: uuid.UUID
    grantor_name: str | None = None
    grantee_id: uuid.UUID
    grantee_name: str | None = None
    scope: ProxyScope
    agenda_item_ids: list[uuid.UUID] | None = None
    status: ProxyStatus
    notes: str | None = None
    confirmed_at: datetime | None = None
    revoked_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProxyListResponse(BaseModel):
    """List response schema for proxies (STORY-073)."""

    id: uuid.UUID
    meeting_id: uuid.UUID
    grantor_id: uuid.UUID
    grantor_name: str | None = None
    grantee_id: uuid.UUID
    grantee_name: str | None = None
    scope: ProxyScope
    status: ProxyStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProxySummary(BaseModel):
    """Summary of proxies for a meeting (STORY-073)."""

    meeting_id: uuid.UUID
    total_proxies: int
    pending_count: int
    confirmed_count: int
    revoked_count: int


class EligibleGrantee(BaseModel):
    """Response schema for eligible proxy recipients (STORY-073)."""

    id: uuid.UUID
    first_name: str
    last_name: str
    full_name: str
    is_board_member: bool = False
