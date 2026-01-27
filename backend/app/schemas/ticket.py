"""Pydantic schemas for Tickets.

Based on FEAT-016 (Bewoner tickets & klachten) and STORY-029 (Bewoner ticket wizard en tijdlijn).
Implements ticket management for residents to submit and track complaints.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TicketStatus(str, Enum):
    """Ticket status values."""

    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_PROGRESS = "in_progress"
    AWAITING_INFO = "awaiting_info"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketCategory(str, Enum):
    """Ticket category values."""

    MAINTENANCE = "maintenance"
    NOISE = "noise"
    SAFETY = "safety"
    CLEANING = "cleaning"
    FACILITIES = "facilities"
    OTHER = "other"


class TicketPriority(str, Enum):
    """Ticket priority values."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SupplierStatus(str, Enum):
    """Supplier collaboration status for tickets (STORY-044)."""

    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# Maximum attachment size: 10MB per D-004
MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

class TicketAttachmentStatus(str, Enum):
    """Attachment status values (STORY-030)."""

    PENDING = "pending"
    TIMELY = "timely"  # Tijdig aangevraagd
    LATE = "late"  # Te laat
    ACCEPTED = "accepted"
    REJECTED = "rejected"


ALLOWED_ATTACHMENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]


class TicketAttachmentBase(BaseModel):
    """Base schema for ticket attachments."""

    description: str | None = Field(None, max_length=500)


class TicketAttachmentCreate(TicketAttachmentBase):
    """Schema for creating a ticket attachment."""

    pass


class TicketAttachmentUpdate(BaseModel):
    """Schema for updating a ticket attachment (STORY-030)."""

    status: TicketAttachmentStatus | None = None
    rejection_reason: str | None = Field(None, max_length=500)


class TicketAttachmentResponse(TicketAttachmentBase):
    """Response schema for ticket attachment."""

    id: uuid.UUID
    ticket_id: uuid.UUID
    file_name: str
    file_type: str
    file_size_bytes: int
    uploaded_by_id: uuid.UUID
    uploaded_by_name: str | None = None
    created_at: datetime
    # STORY-030 fields
    status: TicketAttachmentStatus = TicketAttachmentStatus.PENDING
    is_timely: bool = True
    rejection_reason: str | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_by_name: str | None = None
    reviewed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TicketTimelineEntryResponse(BaseModel):
    """Response schema for ticket timeline entry."""

    id: uuid.UUID
    ticket_id: uuid.UUID
    action: str
    description: str | None = None
    actor_id: uuid.UUID
    actor_name: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketCommentBase(BaseModel):
    """Base schema for ticket comments."""

    content: str = Field(..., min_length=1, max_length=2000)
    is_internal: bool = Field(
        default=False, description="Internal comments visible only to staff"
    )


class TicketCommentCreate(TicketCommentBase):
    """Schema for creating a ticket comment."""

    pass


class TicketCommentUpdate(BaseModel):
    """Schema for updating a ticket comment (STORY-037)."""

    is_answered: bool | None = None


class TicketCommentResponse(TicketCommentBase):
    """Response schema for ticket comment."""

    id: uuid.UUID
    ticket_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str | None = None
    created_at: datetime
    updated_at: datetime
    # STORY-037: Mark as answered
    is_answered: bool = False
    answered_by_id: uuid.UUID | None = None
    answered_by_name: str | None = None
    answered_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TicketBase(BaseModel):
    """Base schema for tickets."""

    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)
    category: TicketCategory
    location: str | None = Field(None, max_length=200)
    priority: TicketPriority = Field(default=TicketPriority.MEDIUM)


class TicketCreate(TicketBase):
    """Schema for creating a ticket."""

    pass


class TicketUpdate(BaseModel):
    """Schema for updating a ticket."""

    title: str | None = Field(None, min_length=3, max_length=200)
    description: str | None = Field(None, min_length=10, max_length=5000)
    category: TicketCategory | None = None
    location: str | None = Field(None, max_length=200)
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    # STORY-038: SLA fields
    sla_due_date: datetime | None = None
    sla_response_hours: int | None = Field(None, ge=1, le=720)  # 1 hour to 30 days


class TicketResponse(TicketBase):
    """Response schema for ticket."""

    id: uuid.UUID
    vve_id: uuid.UUID
    unit_id: uuid.UUID
    submitted_by_id: uuid.UUID
    submitted_by_name: str | None = None
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None
    # STORY-044: Supplier status fields
    supplier_id: uuid.UUID | None = None
    supplier_name: str | None = None
    supplier_status: SupplierStatus | None = None
    supplier_status_note: str | None = None
    supplier_status_updated_at: datetime | None = None
    supplier_status_updated_by_id: uuid.UUID | None = None
    supplier_status_updated_by_name: str | None = None
    # STORY-038: SLA fields
    sla_due_date: datetime | None = None
    sla_response_hours: int | None = None
    sla_breached: bool = False
    sla_breached_at: datetime | None = None
    sla_status: str | None = None  # Calculated: "on_track", "at_risk", "breached"
    sla_remaining_hours: int | None = None  # Calculated remaining time
    attachments: list[TicketAttachmentResponse] = []
    timeline: list[TicketTimelineEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    """Response schema for ticket list item (without timeline/attachments)."""

    id: uuid.UUID
    vve_id: uuid.UUID
    unit_id: uuid.UUID
    submitted_by_id: uuid.UUID
    submitted_by_name: str | None = None
    title: str
    category: TicketCategory
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime
    attachment_count: int = 0
    comment_count: int = 0
    # STORY-044: Supplier status fields
    supplier_id: uuid.UUID | None = None
    supplier_name: str | None = None
    supplier_status: SupplierStatus | None = None
    # STORY-038: SLA fields
    sla_due_date: datetime | None = None
    sla_breached: bool = False
    sla_status: str | None = None  # Calculated: "on_track", "at_risk", "breached"

    model_config = ConfigDict(from_attributes=True)


class TicketDraft(BaseModel):
    """Schema for saving ticket draft (wizard pause/resume)."""

    title: str | None = Field(None, max_length=200)
    description: str | None = Field(None, max_length=5000)
    category: TicketCategory | None = None
    location: str | None = Field(None, max_length=200)
    step: int = Field(default=1, ge=1, le=4)


class TicketSummary(BaseModel):
    """Summary statistics for tickets."""

    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    by_category: dict[str, int]
    by_priority: dict[str, int]


# STORY-044: Supplier status update schema
class TicketSupplierStatusUpdate(BaseModel):
    """Schema for updating supplier status on a ticket (STORY-044)."""

    supplier_id: uuid.UUID | None = None
    supplier_status: SupplierStatus | None = None
    supplier_status_note: str | None = Field(None, max_length=500)


# STORY-035: Supplier schemas
class SupplierBase(BaseModel):
    """Base schema for suppliers."""

    name: str = Field(..., min_length=2, max_length=255)
    contact_person: str | None = Field(None, max_length=255)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=50)
    specialty: str | None = Field(None, max_length=255)
    notes: str | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    """Schema for creating a supplier."""

    pass


class SupplierUpdate(BaseModel):
    """Schema for updating a supplier."""

    name: str | None = Field(None, min_length=2, max_length=255)
    contact_person: str | None = Field(None, max_length=255)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=50)
    specialty: str | None = Field(None, max_length=255)
    notes: str | None = None
    is_active: bool | None = None


class SupplierResponse(SupplierBase):
    """Response schema for supplier."""

    id: uuid.UUID
    vve_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
