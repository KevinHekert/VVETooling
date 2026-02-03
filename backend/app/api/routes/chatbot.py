"""AI Chatbot API routes.

Implements EPIC-017 (AI-Assistent):
- FEAT-038: AI Chatbot (STORY-082)
- Includes escalation support for STORY-123
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_member,
)
from app.db.models.models import (
    ChatConversation,
    ChatMessage,
    User,
    VVE,
    VVEMember,
    ChatMessageRole as DBChatMessageRole,
    ChatEscalationStatus as DBChatEscalationStatus,
)
from app.db.session import get_db
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
    DocumentReference,
)

router = APIRouter(prefix="/vves/{vve_id}/chatbot", tags=["chatbot"])


def parse_follow_up_suggestions(value: str | None) -> list[str]:
    """Parse follow-up suggestions from JSON string."""
    if not value:
        return []
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return []


def serialize_follow_up_suggestions(suggestions: list[str]) -> str | None:
    """Serialize follow-up suggestions to JSON string."""
    if not suggestions:
        return None
    return json.dumps(suggestions)


# ============================================================================
# FAQ Knowledge Base (simple in-memory for MVP)
# ============================================================================

FAQ_KNOWLEDGE_BASE = [
    {
        "keywords": ["contributie", "betaling", "betalen", "kosten"],
        "answer": "De contributie wordt berekend op basis van uw splitsingssleutel. U kunt uw betalingsstatus bekijken in het dashboard onder 'Financieel'.",
        "follow_ups": ["Hoe wordt mijn contributie berekend?", "Wanneer moet ik betalen?"],
    },
    {
        "keywords": ["vergadering", "alv", "algemene ledenvergadering"],
        "answer": "De ALV (Algemene Ledenvergadering) wordt jaarlijks georganiseerd. U ontvangt hiervoor een uitnodiging. U kunt ook digitaal stemmen via de app.",
        "follow_ups": ["Wanneer is de volgende ALV?", "Hoe kan ik digitaal stemmen?"],
    },
    {
        "keywords": ["onderhoud", "reparatie", "storing", "kapot"],
        "answer": "Voor onderhoud of storingen kunt u een ticket aanmaken via 'Serviceverzoeken'. Het bestuur zal dit oppakken en u informeren over de voortgang.",
        "follow_ups": ["Hoe maak ik een melding?", "Wat is de status van mijn melding?"],
    },
    {
        "keywords": ["document", "notulen", "splitsingsakte"],
        "answer": "Alle VVE-documenten zijn beschikbaar in het Documentenportaal. Hier vindt u notulen, de splitsingsakte en financiële overzichten.",
        "follow_ups": ["Waar vind ik de notulen?", "Kan ik documenten downloaden?"],
    },
    {
        "keywords": ["reserve", "reservefonds", "sparen"],
        "answer": "Het reservefonds wordt aangehouden voor groot onderhoud. De stand en prognose zijn te vinden in het dashboard onder 'Reserves'.",
        "follow_ups": ["Hoeveel staat er in het reservefonds?", "Waarvoor is het reservefonds bedoeld?"],
    },
]


def generate_chatbot_response(question: str) -> tuple[str, list[str]]:
    """Generate a response based on the question using keyword matching.
    
    Returns:
        Tuple of (answer, follow_up_suggestions)
    """
    question_lower = question.lower()
    
    for faq in FAQ_KNOWLEDGE_BASE:
        for keyword in faq["keywords"]:
            if keyword in question_lower:
                return faq["answer"], faq["follow_ups"]
    
    # Default response
    return (
        "Bedankt voor uw vraag. Ik heb hier geen direct antwoord op. "
        "U kunt uw vraag escaleren naar het bestuur door op 'Escaleren' te klikken, "
        "of probeer een specifiekere vraag te stellen.",
        ["Hoe kan ik het bestuur bereiken?", "Waar vind ik meer informatie?"],
    )


# ============================================================================
# Conversation Management (STORY-082)
# ============================================================================


@router.post(
    "/conversations",
    response_model=ChatConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start een nieuw chatgesprek",
    description="""
Start een nieuw gesprek met de AI-chatbot.

**STORY-082**: Als eigenaar wil ik een vraag kunnen stellen aan de AI-chatbot.

De chatbot beantwoordt veelgestelde vragen over:
- Contributie en betalingen
- ALV en vergaderingen
- Onderhoud en storingen
- Documenten
- Reservefonds
    """,
)
async def create_conversation(
    vve_id: uuid.UUID,
    conversation_data: ChatConversationCreate,
    current_user: Annotated[User, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatConversationResponse:
    """Create a new chat conversation."""
    # Verify VVE exists
    vve_query = select(VVE).where(VVE.id == vve_id)
    vve_result = await db.execute(vve_query)
    vve = vve_result.scalar_one_or_none()
    if not vve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Verify user is member of this VVE
    member_query = select(VVEMember).where(
        VVEMember.vve_id == vve_id,
        VVEMember.user_id == current_user.id,
    )
    member_result = await db.execute(member_query)
    if not member_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="U bent geen lid van deze VVE",
        )

    now = datetime.now(timezone.utc)
    conversation_id = uuid.uuid4()

    # Create conversation
    conversation = ChatConversation(
        id=conversation_id,
        vve_id=vve_id,
        user_id=current_user.id,
        escalation_status=DBChatEscalationStatus.NONE,
        created_at=now,
        updated_at=now,
    )
    db.add(conversation)

    # Add user message
    user_message = ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=DBChatMessageRole.USER,
        content=conversation_data.initial_message,
        created_at=now,
    )
    db.add(user_message)

    # Generate and add assistant response
    answer, follow_ups = generate_chatbot_response(conversation_data.initial_message)
    assistant_message = ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=DBChatMessageRole.ASSISTANT,
        content=answer,
        follow_up_suggestions=serialize_follow_up_suggestions(follow_ups),
        created_at=now,
    )
    db.add(assistant_message)

    await db.commit()
    await db.refresh(conversation)

    return ChatConversationResponse(
        id=conversation.id,
        vve_id=conversation.vve_id,
        user_id=conversation.user_id,
        messages=[
            ChatMessageResponse(
                id=user_message.id,
                role=ChatMessageRole.USER,
                content=user_message.content,
                created_at=user_message.created_at,
                document_references=[],
                follow_up_suggestions=[],
            ),
            ChatMessageResponse(
                id=assistant_message.id,
                role=ChatMessageRole.ASSISTANT,
                content=assistant_message.content,
                created_at=assistant_message.created_at,
                document_references=[],
                follow_up_suggestions=follow_ups,
            ),
        ],
        escalation_status=ChatEscalationStatus(conversation.escalation_status.value),
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.get(
    "/conversations",
    response_model=list[ChatConversationSummary],
    summary="Lijst van gesprekken",
    description="Haal alle chatgesprekken van de huidige gebruiker op.",
)
async def list_conversations(
    vve_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> list[ChatConversationSummary]:
    """List all conversations for the current user."""
    query = (
        select(ChatConversation)
        .where(
            ChatConversation.vve_id == vve_id,
            ChatConversation.user_id == current_user.id,
        )
        .order_by(ChatConversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    conversations = result.scalars().all()

    summaries = []
    for conv in conversations:
        # Get first message
        first_msg_query = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.asc())
            .limit(1)
        )
        first_msg_result = await db.execute(first_msg_query)
        first_msg = first_msg_result.scalar_one_or_none()

        # Count messages
        count_query = select(func.count()).where(
            ChatMessage.conversation_id == conv.id
        )
        count_result = await db.execute(count_query)
        message_count = count_result.scalar() or 0

        summaries.append(
            ChatConversationSummary(
                id=conv.id,
                first_message=first_msg.content[:100] if first_msg else "",
                message_count=message_count,
                escalation_status=ChatEscalationStatus(conv.escalation_status.value),
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            )
        )

    return summaries


@router.get(
    "/conversations/{conversation_id}",
    response_model=ChatConversationResponse,
    summary="Haal gesprek op",
    description="Haal een specifiek chatgesprek op met alle berichten.",
)
async def get_conversation(
    vve_id: uuid.UUID,
    conversation_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatConversationResponse:
    """Get a specific conversation with all messages."""
    query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.vve_id == vve_id,
        ChatConversation.user_id == current_user.id,
    )
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gesprek niet gevonden",
        )

    # Get all messages
    messages_query = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages_result = await db.execute(messages_query)
    messages = messages_result.scalars().all()

    return ChatConversationResponse(
        id=conversation.id,
        vve_id=conversation.vve_id,
        user_id=conversation.user_id,
        messages=[
            ChatMessageResponse(
                id=msg.id,
                role=ChatMessageRole(msg.role.value),
                content=msg.content,
                created_at=msg.created_at,
                document_references=[],
                follow_up_suggestions=parse_follow_up_suggestions(msg.follow_up_suggestions),
            )
            for msg in messages
        ],
        escalation_status=ChatEscalationStatus(conversation.escalation_status.value),
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Stuur een bericht",
    description="""
Stuur een nieuw bericht in een bestaand gesprek.

De chatbot reageert automatisch met een antwoord.
    """,
)
async def add_message(
    vve_id: uuid.UUID,
    conversation_id: uuid.UUID,
    message_data: ChatMessageCreate,
    current_user: Annotated[User, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatMessageResponse:
    """Add a new message to a conversation."""
    # Verify conversation exists and belongs to user
    query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.vve_id == vve_id,
        ChatConversation.user_id == current_user.id,
    )
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gesprek niet gevonden",
        )

    now = datetime.now(timezone.utc)

    # Add user message
    user_message = ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=DBChatMessageRole.USER,
        content=message_data.content,
        created_at=now,
    )
    db.add(user_message)

    # Generate and add assistant response
    answer, follow_ups = generate_chatbot_response(message_data.content)
    assistant_message = ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=DBChatMessageRole.ASSISTANT,
        content=answer,
        follow_up_suggestions=serialize_follow_up_suggestions(follow_ups),
        created_at=now,
    )
    db.add(assistant_message)

    # Update conversation timestamp
    conversation.updated_at = now

    await db.commit()

    return ChatMessageResponse(
        id=assistant_message.id,
        role=ChatMessageRole.ASSISTANT,
        content=assistant_message.content,
        created_at=assistant_message.created_at,
        document_references=[],
        follow_up_suggestions=follow_ups,
    )


# ============================================================================
# Escalation (STORY-123)
# ============================================================================


@router.post(
    "/conversations/{conversation_id}/escalate",
    response_model=ChatEscalationResponse,
    summary="Escaleer naar bestuur",
    description="""
Escaleer een gesprek naar het bestuur.

**STORY-123**: Als eigenaar wil ik een vraag kunnen escaleren naar het bestuur
als de chatbot geen bevredigend antwoord geeft.
    """,
)
async def escalate_conversation(
    vve_id: uuid.UUID,
    conversation_id: uuid.UUID,
    escalation_data: ChatEscalationRequest,
    current_user: Annotated[User, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChatEscalationResponse:
    """Escalate a conversation to the board."""
    # Verify conversation exists and belongs to user
    query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.vve_id == vve_id,
        ChatConversation.user_id == current_user.id,
    )
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gesprek niet gevonden",
        )

    if conversation.escalation_status != DBChatEscalationStatus.NONE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dit gesprek is al geëscaleerd",
        )

    now = datetime.now(timezone.utc)

    # Update escalation status
    conversation.escalation_status = DBChatEscalationStatus.ESCALATED
    conversation.escalation_reason = escalation_data.reason
    conversation.escalated_at = now
    conversation.updated_at = now

    # Add system message about escalation
    system_message = ChatMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=DBChatMessageRole.SYSTEM,
        content=f"Dit gesprek is geëscaleerd naar het bestuur. Reden: {escalation_data.reason}",
        created_at=now,
    )
    db.add(system_message)

    await db.commit()

    return ChatEscalationResponse(
        conversation_id=conversation.id,
        escalation_status=ChatEscalationStatus.ESCALATED,
        reason=escalation_data.reason,
        escalated_at=now,
    )
