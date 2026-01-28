"""Pydantic schemas for Digital Voting & Polls.

Based on EPIC-027 (Digitaal Stemmen & Polls):
- FEAT-067: Digitale Stemming (STORY-113, STORY-114, STORY-115)
- FEAT-068: Polls & Peilingen
- FEAT-069: Volmacht Beheer
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VotingStatus(str, Enum):
    """Status of a voting/poll."""

    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class VoteChoice(str, Enum):
    """Vote choices."""

    VOOR = "voor"
    TEGEN = "tegen"
    BLANCO = "blanco"


# ============================================================================
# Voting Schemas (STORY-113)
# ============================================================================


class VotingBase(BaseModel):
    """Base schema for voting."""

    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(None, max_length=5000)
    start_date: datetime
    end_date: datetime
    meeting_id: uuid.UUID | None = None
    quorum_percentage: int = Field(50, ge=1, le=100)

    @field_validator('end_date')
    @classmethod
    def end_date_after_start(cls, v: datetime, info) -> datetime:
        """Validate that end date is after start date."""
        start = info.data.get('start_date')
        if start and v <= start:
            raise ValueError('Einddatum moet na startdatum liggen')
        return v


class VotingCreate(VotingBase):
    """Schema for creating a voting (STORY-113)."""

    pass


class VotingUpdate(BaseModel):
    """Schema for updating a voting."""

    title: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = Field(None, max_length=5000)
    start_date: datetime | None = None
    end_date: datetime | None = None
    quorum_percentage: int | None = Field(None, ge=1, le=100)
    status: VotingStatus | None = None


class VotingResponse(VotingBase):
    """Response schema for voting."""

    id: uuid.UUID
    vve_id: uuid.UUID
    status: VotingStatus
    total_votes: int = 0
    votes_for: int = 0
    votes_against: int = 0
    votes_abstain: int = 0
    quorum_reached: bool | None = None
    result_percentage_for: Decimal | None = None
    created_by_id: uuid.UUID | None = None
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    # Calculated fields
    is_active: bool = False
    days_remaining: int | None = None
    participation_percentage: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)


class VotingListResponse(BaseModel):
    """List response for votings."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    status: VotingStatus
    start_date: datetime
    end_date: datetime
    total_votes: int
    is_active: bool
    days_remaining: int | None


# ============================================================================
# Vote Schemas (STORY-114)
# ============================================================================


class VoteCreate(BaseModel):
    """Schema for casting a vote (STORY-114)."""

    unit_id: uuid.UUID
    choice: VoteChoice


class VoteResponse(BaseModel):
    """Response schema for vote."""

    id: uuid.UUID
    voting_id: uuid.UUID
    unit_id: uuid.UUID
    unit_number: str | None = None
    user_id: uuid.UUID | None = None
    user_name: str | None = None
    choice: VoteChoice
    share_percentage: Decimal
    voted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VoteConfirmation(BaseModel):
    """Confirmation response after casting vote."""

    voting_id: uuid.UUID
    voting_title: str
    choice: VoteChoice
    voted_at: datetime
    message: str


# ============================================================================
# Voting Results Schemas (STORY-115)
# ============================================================================


class VotingResultsSummary(BaseModel):
    """Summary of voting results (STORY-115)."""

    voting_id: uuid.UUID
    title: str
    status: VotingStatus
    # Totals
    total_eligible_shares: Decimal
    total_voted_shares: Decimal
    participation_percentage: Decimal
    # Votes by choice
    votes_for_count: int
    votes_for_shares: Decimal
    votes_for_percentage: Decimal
    votes_against_count: int
    votes_against_shares: Decimal
    votes_against_percentage: Decimal
    votes_abstain_count: int
    votes_abstain_shares: Decimal
    votes_abstain_percentage: Decimal
    # Quorum
    quorum_percentage_required: int
    quorum_reached: bool
    # Result
    result: str  # "aangenomen", "verworpen", "geen quorum"
    closed_at: datetime | None = None


class VotingResultsDetail(VotingResultsSummary):
    """Detailed voting results with individual votes."""

    votes: list[VoteResponse]


# ============================================================================
# Poll Schemas (STORY-116)
# ============================================================================


class PollStatus(str, Enum):
    """Status of a poll."""

    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class PollResultsVisibility(str, Enum):
    """Who can see poll results."""

    ALL = "all"
    BOARD_ONLY = "board_only"
    AFTER_VOTE = "after_vote"


class PollOptionBase(BaseModel):
    """Base option in a poll."""

    text: str = Field(..., min_length=1, max_length=255)


class PollOptionResponse(PollOptionBase):
    """Option in a poll with statistics."""

    id: uuid.UUID
    vote_count: int = 0
    percentage: Decimal = Decimal("0.0")
    display_order: int = 0

    model_config = ConfigDict(from_attributes=True)


class PollCreate(BaseModel):
    """Schema for creating a poll (STORY-116)."""

    title: str = Field(..., min_length=3, max_length=255)
    description: str | None = Field(None, max_length=2000)
    options: list[str] = Field(..., min_length=2, max_length=10)
    end_date: datetime
    allow_multiple: bool = False
    is_anonymous: bool = False
    results_visibility: PollResultsVisibility = PollResultsVisibility.ALL


class PollUpdate(BaseModel):
    """Schema for updating a poll."""

    title: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = Field(None, max_length=2000)
    end_date: datetime | None = None
    allow_multiple: bool | None = None
    is_anonymous: bool | None = None
    results_visibility: PollResultsVisibility | None = None
    status: PollStatus | None = None


class PollResponse(BaseModel):
    """Response schema for poll."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    description: str | None
    options: list[PollOptionResponse]
    end_date: datetime
    allow_multiple: bool
    is_anonymous: bool
    results_visibility: PollResultsVisibility
    total_votes: int
    total_participants: int
    status: PollStatus
    created_by_id: uuid.UUID | None
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    # Calculated fields
    is_active: bool = False
    days_remaining: int | None = None
    has_voted: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class PollListResponse(BaseModel):
    """List response for polls."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    status: PollStatus
    end_date: datetime
    total_participants: int
    is_anonymous: bool
    is_active: bool
    days_remaining: int | None


class PollVoteCreate(BaseModel):
    """Schema for voting on a poll."""

    option_ids: list[uuid.UUID] = Field(..., min_length=1)


class PollVoteResponse(BaseModel):
    """Response after voting on a poll."""

    poll_id: uuid.UUID
    poll_title: str
    selected_options: list[str]
    voted_at: datetime
    message: str


# Legacy alias for backwards compatibility
PollOption = PollOptionResponse


# ============================================================================
# Digital Proxy Schemas (STORY-117)
# ============================================================================


class VotingProxyStatus(str, Enum):
    """Status of a voting proxy."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    REVOKED = "revoked"
    USED = "used"


class VotingProxyCreate(BaseModel):
    """Schema for registering a digital voting proxy (STORY-117)."""

    grantee_id: uuid.UUID
    unit_id: uuid.UUID
    voting_id: uuid.UUID | None = None  # Specific voting or all votings
    notes: str | None = Field(None, max_length=1000)


class VotingProxyUpdate(BaseModel):
    """Schema for updating a voting proxy."""

    notes: str | None = Field(None, max_length=1000)


class VotingProxyResponse(BaseModel):
    """Response schema for voting proxy."""

    id: uuid.UUID
    grantor_id: uuid.UUID
    grantor_name: str
    grantee_id: uuid.UUID
    grantee_name: str
    unit_id: uuid.UUID
    unit_number: str
    voting_id: uuid.UUID | None
    voting_title: str | None
    vve_id: uuid.UUID
    status: VotingProxyStatus
    notes: str | None
    confirmed_at: datetime | None
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VotingProxyListResponse(BaseModel):
    """List response for voting proxies."""

    id: uuid.UUID
    grantor_name: str
    grantee_name: str
    unit_number: str
    voting_title: str | None
    status: VotingProxyStatus
    created_at: datetime


class VotingProxyConfirmation(BaseModel):
    """Confirmation response for proxy operations."""

    proxy_id: uuid.UUID
    message: str
    status: VotingProxyStatus


# Legacy aliases for backwards compatibility
DigitalProxyCreate = VotingProxyCreate
DigitalProxyResponse = VotingProxyResponse
