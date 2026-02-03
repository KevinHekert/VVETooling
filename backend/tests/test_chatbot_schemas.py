"""Tests for Chatbot schemas - validation logic.

Based on STORY-082: AI chatbot vraag stellen.
"""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.chatbot import (
    ChatConversationCreate,
    ChatConversationResponse,
    ChatConversationSummary,
    ChatEscalationRequest,
    ChatEscalationResponse,
    ChatEscalationStatus,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatMessageRole,
    ChatbotAnswerRequest,
    ChatbotAnswerResponse,
    DocumentReference,
)


class TestChatMessageSchemas:
    """Tests for chat message schemas."""

    def test_chat_message_create_valid(self):
        """Test valid chat message creation."""
        message = ChatMessageCreate(content="Wat is mijn contributie?")
        assert message.content == "Wat is mijn contributie?"

    def test_chat_message_create_empty_fails(self):
        """Test that empty message fails validation."""
        with pytest.raises(ValueError):
            ChatMessageCreate(content="")

    def test_chat_message_create_max_length(self):
        """Test message max length validation."""
        # Message with 4000 characters should pass
        long_message = "a" * 4000
        message = ChatMessageCreate(content=long_message)
        assert len(message.content) == 4000

    def test_chat_message_create_too_long_fails(self):
        """Test that too long message fails validation."""
        too_long = "a" * 4001
        with pytest.raises(ValueError):
            ChatMessageCreate(content=too_long)

    def test_chat_message_response_with_suggestions(self):
        """Test chat message response with follow-up suggestions."""
        response = ChatMessageResponse(
            id=uuid.uuid4(),
            role=ChatMessageRole.ASSISTANT,
            content="Uw contributie is €150 per maand.",
            created_at=datetime.now(timezone.utc),
            document_references=[],
            follow_up_suggestions=["Hoe wordt dit berekend?", "Wanneer moet ik betalen?"],
        )
        assert len(response.follow_up_suggestions) == 2
        assert response.role == ChatMessageRole.ASSISTANT


class TestChatConversationSchemas:
    """Tests for chat conversation schemas."""

    def test_conversation_create_valid(self):
        """Test valid conversation creation."""
        conv = ChatConversationCreate(
            initial_message="Hoe kan ik een melding maken?"
        )
        assert conv.initial_message == "Hoe kan ik een melding maken?"

    def test_conversation_response_with_messages(self):
        """Test conversation response with multiple messages."""
        now = datetime.now(timezone.utc)
        conv_id = uuid.uuid4()
        vve_id = uuid.uuid4()
        user_id = uuid.uuid4()

        response = ChatConversationResponse(
            id=conv_id,
            vve_id=vve_id,
            user_id=user_id,
            messages=[
                ChatMessageResponse(
                    id=uuid.uuid4(),
                    role=ChatMessageRole.USER,
                    content="Vraag 1",
                    created_at=now,
                    document_references=[],
                    follow_up_suggestions=[],
                ),
                ChatMessageResponse(
                    id=uuid.uuid4(),
                    role=ChatMessageRole.ASSISTANT,
                    content="Antwoord 1",
                    created_at=now,
                    document_references=[],
                    follow_up_suggestions=["Vervolgvraag?"],
                ),
            ],
            escalation_status=ChatEscalationStatus.NONE,
            created_at=now,
            updated_at=now,
        )
        
        assert len(response.messages) == 2
        assert response.escalation_status == ChatEscalationStatus.NONE

    def test_conversation_summary(self):
        """Test conversation summary schema."""
        now = datetime.now(timezone.utc)
        
        summary = ChatConversationSummary(
            id=uuid.uuid4(),
            first_message="Wat is de contributie?",
            message_count=4,
            escalation_status=ChatEscalationStatus.NONE,
            created_at=now,
            updated_at=now,
        )
        
        assert summary.message_count == 4
        assert "contributie" in summary.first_message


class TestChatEscalationSchemas:
    """Tests for escalation schemas (STORY-123)."""

    def test_escalation_request_valid(self):
        """Test valid escalation request."""
        request = ChatEscalationRequest(
            reason="De chatbot kan mijn specifieke vraag over het huishoudelijk reglement niet beantwoorden."
        )
        assert "huishoudelijk reglement" in request.reason

    def test_escalation_request_empty_fails(self):
        """Test that empty reason fails validation."""
        with pytest.raises(ValueError):
            ChatEscalationRequest(reason="")

    def test_escalation_response(self):
        """Test escalation response schema."""
        now = datetime.now(timezone.utc)
        conv_id = uuid.uuid4()

        response = ChatEscalationResponse(
            conversation_id=conv_id,
            escalation_status=ChatEscalationStatus.ESCALATED,
            reason="Vraag over specifieke situatie",
            escalated_at=now,
        )

        assert response.escalation_status == ChatEscalationStatus.ESCALATED


class TestDocumentReferenceSchema:
    """Tests for document reference schema."""

    def test_document_reference_creation(self):
        """Test document reference with all fields."""
        doc_ref = DocumentReference(
            document_id=uuid.uuid4(),
            title="Huishoudelijk Reglement 2026",
            path="/documenten/hr-2026.pdf",
        )
        
        assert "Huishoudelijk" in doc_ref.title
        assert doc_ref.path is not None

    def test_document_reference_minimal(self):
        """Test document reference with minimal fields."""
        doc_ref = DocumentReference(
            document_id=uuid.uuid4(),
            title="Notulen ALV",
        )
        
        assert doc_ref.path is None


class TestChatbotAnswerSchemas:
    """Tests for internal chatbot answer generation schemas."""

    def test_answer_request(self):
        """Test answer request schema."""
        request = ChatbotAnswerRequest(
            question="Wanneer is de volgende ALV?",
            vve_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
        )
        
        assert request.conversation_id is None

    def test_answer_response_with_references(self):
        """Test answer response with document references."""
        doc_id = uuid.uuid4()
        
        response = ChatbotAnswerResponse(
            answer="De volgende ALV is gepland op 15 maart.",
            document_references=[
                DocumentReference(
                    document_id=doc_id,
                    title="Uitnodiging ALV",
                )
            ],
            follow_up_suggestions=["Wat staat er op de agenda?"],
            confidence=0.85,
        )
        
        assert len(response.document_references) == 1
        assert response.confidence == 0.85

    def test_answer_response_confidence_bounds(self):
        """Test that confidence must be between 0 and 1."""
        # Valid confidence
        response = ChatbotAnswerResponse(
            answer="Test",
            confidence=0.5,
        )
        assert response.confidence == 0.5

        # Invalid: too high
        with pytest.raises(ValueError):
            ChatbotAnswerResponse(answer="Test", confidence=1.5)

        # Invalid: negative
        with pytest.raises(ValueError):
            ChatbotAnswerResponse(answer="Test", confidence=-0.1)
