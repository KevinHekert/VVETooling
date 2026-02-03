"""Pydantic schemas for AI Chatbot.

Based on FEAT-038 (AI Chatbot) and STORY-082 (AI chatbot vraag stellen).
Implements chatbot message schemas for residents to ask questions about VVE matters.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ChatMessageRole(str, Enum):
    """Role of the chat message sender."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatEscalationStatus(str, Enum):
    """Status of chat escalation to the board (STORY-123)."""

    NONE = "none"
    REQUESTED = "requested"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class DocumentReference(BaseModel):
    """Reference to a document mentioned in a chat response."""

    document_id: uuid.UUID
    title: str
    path: str | None = None


class ChatMessageBase(BaseModel):
    """Base schema for chat messages."""

    content: str = Field(..., min_length=1, max_length=4000)


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a new chat message (user question)."""

    pass


class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: ChatMessageRole
    created_at: datetime
    document_references: list[DocumentReference] = Field(default_factory=list)
    follow_up_suggestions: list[str] = Field(default_factory=list)


class ChatConversationCreate(BaseModel):
    """Schema for creating a new chat conversation."""

    initial_message: str = Field(..., min_length=1, max_length=4000)


class ChatConversationResponse(BaseModel):
    """Schema for chat conversation response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    vve_id: uuid.UUID
    user_id: uuid.UUID
    messages: list[ChatMessageResponse] = Field(default_factory=list)
    escalation_status: ChatEscalationStatus = ChatEscalationStatus.NONE
    created_at: datetime
    updated_at: datetime


class ChatConversationSummary(BaseModel):
    """Summary schema for listing conversations."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_message: str
    message_count: int
    escalation_status: ChatEscalationStatus
    created_at: datetime
    updated_at: datetime


class ChatEscalationRequest(BaseModel):
    """Schema for requesting escalation to the board (STORY-123)."""

    reason: str = Field(..., min_length=1, max_length=1000)


class ChatEscalationResponse(BaseModel):
    """Schema for escalation response."""

    model_config = ConfigDict(from_attributes=True)

    conversation_id: uuid.UUID
    escalation_status: ChatEscalationStatus
    reason: str
    escalated_at: datetime


class ChatbotAnswerRequest(BaseModel):
    """Internal schema for generating chatbot answers."""

    question: str
    vve_id: uuid.UUID
    user_id: uuid.UUID
    conversation_id: uuid.UUID | None = None


class ChatbotAnswerResponse(BaseModel):
    """Internal schema for chatbot answer generation."""

    answer: str
    document_references: list[DocumentReference] = Field(default_factory=list)
    follow_up_suggestions: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
