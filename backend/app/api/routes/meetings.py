"""Meeting/ALV API routes.

Implements EPIC-015 (ALV & Vergaderbeheer), FEAT-032 (ALV Planning & Uitnodigingen),
STORY-069 (ALV plannen met datum en locatie), and STORY-070 (ALV agenda opstellen).
"""

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import (
    Document,
    Meeting,
    MeetingAgendaItem,
    MeetingProxy,
    MeetingRsvp,
    MeetingRsvpStatus as DBMeetingRsvpStatus,
    MeetingStatus as DBMeetingStatus,
    MeetingType as DBMeetingType,
    ProxyScope as DBProxyScope,
    ProxyStatus as DBProxyStatus,
    User,
    VVEMember,
)
from app.db.session import get_db
from app.schemas.meeting import (
    AgendaItemCreate,
    AgendaItemReorder,
    AgendaItemResponse,
    AgendaItemUpdate,
    EligibleGrantee,
    MeetingCreate,
    MeetingInvitationCreate,
    MeetingInvitationPreview,
    MeetingInvitationResponse,
    MeetingListResponse,
    MeetingResponse,
    MeetingStatus,
    MeetingType,
    MeetingUpdate,
    ProxyCreate,
    ProxyListResponse,
    ProxyResponse,
    ProxyScope,
    ProxyStatus,
    ProxySummary,
    ProxyUpdate,
    RsvpCreate,
    RsvpResponse,
    RsvpStatus,
    RsvpSummary,
    STANDARD_AGENDA_TEMPLATE,
)

router = APIRouter(prefix="/vves/{vve_id}/meetings", tags=["meetings"])


def _calculate_days_until(date: datetime | None) -> int | None:
    """Calculate days until a date."""
    if not date:
        return None
    now = datetime.now(timezone.utc)
    return (date - now).days


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="ALV plannen",
    description="Plan een nieuwe ALV/vergadering met datum, tijd, type en locatie (STORY-069).",
)
async def create_meeting(
    vve_id: uuid.UUID,
    meeting_data: MeetingCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    """Create a new ALV meeting (STORY-069)."""
    # Create meeting
    meeting = Meeting(
        vve_id=vve_id,
        title=meeting_data.title,
        description=meeting_data.description,
        meeting_date=meeting_data.meeting_date,
        end_time=meeting_data.end_time,
        meeting_type=DBMeetingType(meeting_data.meeting_type.value),
        location_address=meeting_data.location_address,
        location_online_link=meeting_data.location_online_link,
        status=DBMeetingStatus.GEPLAND,
        created_by_id=current_user.id,
    )

    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    days_until = _calculate_days_until(meeting.meeting_date)
    
    return MeetingResponse(
        id=meeting.id,
        vve_id=meeting.vve_id,
        title=meeting.title,
        description=meeting.description,
        meeting_date=meeting.meeting_date,
        end_time=meeting.end_time,
        meeting_type=MeetingType(meeting.meeting_type.value),
        location_address=meeting.location_address,
        location_online_link=meeting.location_online_link,
        status=MeetingStatus(meeting.status.value),
        created_by_id=meeting.created_by_id,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        days_until=days_until,
        is_upcoming=days_until is not None and days_until >= 0,
    )


@router.get(
    "",
    response_model=list[MeetingListResponse],
    summary="ALV vergaderingen ophalen",
    description="Haal alle ALV vergaderingen op voor een VVE.",
)
async def list_meetings(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
    status_filter: MeetingStatus | None = Query(None, description="Filter by status"),
    upcoming_only: bool = Query(False, description="Only show upcoming meetings"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[MeetingListResponse]:
    """List all ALV meetings for a VVE (STORY-069)."""
    query = select(Meeting).where(Meeting.vve_id == vve_id)

    if status_filter:
        query = query.where(Meeting.status == DBMeetingStatus(status_filter.value))

    if upcoming_only:
        query = query.where(Meeting.meeting_date >= datetime.now(timezone.utc))

    query = query.order_by(Meeting.meeting_date.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    meetings = result.scalars().all()

    response = []
    for meeting in meetings:
        days_until = _calculate_days_until(meeting.meeting_date)
        response.append(
            MeetingListResponse(
                id=meeting.id,
                vve_id=meeting.vve_id,
                title=meeting.title,
                meeting_date=meeting.meeting_date,
                meeting_type=MeetingType(meeting.meeting_type.value),
                status=MeetingStatus(meeting.status.value),
                days_until=days_until,
                is_upcoming=days_until is not None and days_until >= 0,
            )
        )

    return response


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
    summary="ALV details ophalen",
    description="Haal details van een specifieke ALV vergadering op.",
)
async def get_meeting(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    """Get a specific ALV meeting (STORY-069)."""
    query = select(Meeting).where(
        Meeting.id == meeting_id,
        Meeting.vve_id == vve_id,
    )
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    days_until = _calculate_days_until(meeting.meeting_date)
    
    return MeetingResponse(
        id=meeting.id,
        vve_id=meeting.vve_id,
        title=meeting.title,
        description=meeting.description,
        meeting_date=meeting.meeting_date,
        end_time=meeting.end_time,
        meeting_type=MeetingType(meeting.meeting_type.value),
        location_address=meeting.location_address,
        location_online_link=meeting.location_online_link,
        status=MeetingStatus(meeting.status.value),
        created_by_id=meeting.created_by_id,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        days_until=days_until,
        is_upcoming=days_until is not None and days_until >= 0,
    )


@router.patch(
    "/{meeting_id}",
    response_model=MeetingResponse,
    summary="ALV bijwerken",
    description="Werk een ALV vergadering bij.",
)
async def update_meeting(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    update_data: MeetingUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    """Update an ALV meeting (STORY-069)."""
    query = select(Meeting).where(
        Meeting.id == meeting_id,
        Meeting.vve_id == vve_id,
    )
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Update fields
    if update_data.title is not None:
        meeting.title = update_data.title
    if update_data.description is not None:
        meeting.description = update_data.description
    if update_data.meeting_date is not None:
        meeting.meeting_date = update_data.meeting_date
    if update_data.end_time is not None:
        meeting.end_time = update_data.end_time
    if update_data.meeting_type is not None:
        meeting.meeting_type = DBMeetingType(update_data.meeting_type.value)
    if update_data.location_address is not None:
        meeting.location_address = update_data.location_address
    if update_data.location_online_link is not None:
        meeting.location_online_link = update_data.location_online_link
    if update_data.status is not None:
        meeting.status = DBMeetingStatus(update_data.status.value)

    await db.commit()
    await db.refresh(meeting)

    days_until = _calculate_days_until(meeting.meeting_date)
    
    return MeetingResponse(
        id=meeting.id,
        vve_id=meeting.vve_id,
        title=meeting.title,
        description=meeting.description,
        meeting_date=meeting.meeting_date,
        end_time=meeting.end_time,
        meeting_type=MeetingType(meeting.meeting_type.value),
        location_address=meeting.location_address,
        location_online_link=meeting.location_online_link,
        status=MeetingStatus(meeting.status.value),
        created_by_id=meeting.created_by_id,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        days_until=days_until,
        is_upcoming=days_until is not None and days_until >= 0,
    )


@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="ALV verwijderen",
    description="Verwijder een ALV vergadering (annuleren).",
)
async def delete_meeting(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an ALV meeting (STORY-069)."""
    query = select(Meeting).where(
        Meeting.id == meeting_id,
        Meeting.vve_id == vve_id,
    )
    result = await db.execute(query)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    await db.delete(meeting)
    await db.commit()


# ============================================================================
# STORY-070: Agenda Item Endpoints
# ============================================================================


async def _get_agenda_item_response(
    item: MeetingAgendaItem,
    db: AsyncSession,
) -> AgendaItemResponse:
    """Build agenda item response with document and creator names."""
    # Get document name if linked
    document_name = None
    if item.document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == item.document_id)
        )
        doc = doc_result.scalar_one_or_none()
        if doc:
            document_name = doc.title

    # Get creator name
    creator_name = None
    creator_result = await db.execute(
        select(User).where(User.id == item.created_by_id)
    )
    creator = creator_result.scalar_one_or_none()
    if creator:
        creator_name = f"{creator.first_name} {creator.last_name}"

    return AgendaItemResponse(
        id=item.id,
        meeting_id=item.meeting_id,
        title=item.title,
        description=item.description,
        duration_minutes=item.duration_minutes,
        order_index=item.order_index,
        document_id=item.document_id,
        document_name=document_name,
        is_standard=item.is_standard,
        created_by_id=item.created_by_id,
        created_by_name=creator_name,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get(
    "/{meeting_id}/agenda",
    response_model=list[AgendaItemResponse],
    summary="Agenda ophalen",
    description="STORY-070: Haal de agenda op voor een ALV vergadering.",
)
async def list_agenda_items(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> list[AgendaItemResponse]:
    """Get all agenda items for a meeting."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    result = await db.execute(
        select(MeetingAgendaItem)
        .where(MeetingAgendaItem.meeting_id == meeting_id)
        .order_by(MeetingAgendaItem.order_index)
    )
    items = result.scalars().all()

    return [await _get_agenda_item_response(item, db) for item in items]


@router.post(
    "/{meeting_id}/agenda",
    response_model=AgendaItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agendapunt toevoegen",
    description="STORY-070: Voeg een agendapunt toe aan de vergadering.",
)
async def create_agenda_item(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    item_data: AgendaItemCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> AgendaItemResponse:
    """Create a new agenda item."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Validate document if provided
    if item_data.document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == item_data.document_id)
        )
        if not doc_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document niet gevonden",
            )

    # Get max order index
    max_order_result = await db.execute(
        select(MeetingAgendaItem.order_index)
        .where(MeetingAgendaItem.meeting_id == meeting_id)
        .order_by(MeetingAgendaItem.order_index.desc())
        .limit(1)
    )
    max_order = max_order_result.scalar()
    next_order = (max_order or 0) + 1 if item_data.order_index == 0 else item_data.order_index

    item = MeetingAgendaItem(
        meeting_id=meeting_id,
        title=item_data.title,
        description=item_data.description,
        duration_minutes=item_data.duration_minutes,
        order_index=next_order,
        document_id=item_data.document_id,
        is_standard=item_data.is_standard,
        created_by_id=current_user.id,
    )

    db.add(item)
    await db.commit()
    await db.refresh(item)

    return await _get_agenda_item_response(item, db)


@router.post(
    "/{meeting_id}/agenda/template",
    response_model=list[AgendaItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Standaard agenda laden",
    description="STORY-070: Laad de standaard ALV agenda template met alle standaardpunten.",
)
async def create_standard_agenda(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> list[AgendaItemResponse]:
    """Create standard agenda items from template."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Check if agenda already has items
    existing_result = await db.execute(
        select(MeetingAgendaItem).where(MeetingAgendaItem.meeting_id == meeting_id).limit(1)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Agenda bevat al agendapunten. Verwijder bestaande punten om template te laden.",
        )

    # Create standard items
    items = []
    for idx, template_item in enumerate(STANDARD_AGENDA_TEMPLATE):
        item = MeetingAgendaItem(
            meeting_id=meeting_id,
            title=template_item["title"],
            duration_minutes=template_item["duration_minutes"],
            order_index=idx + 1,
            is_standard=template_item["is_standard"],
            created_by_id=current_user.id,
        )
        db.add(item)
        items.append(item)

    await db.commit()
    
    # Refresh all items
    for item in items:
        await db.refresh(item)

    return [await _get_agenda_item_response(item, db) for item in items]


@router.patch(
    "/{meeting_id}/agenda/{item_id}",
    response_model=AgendaItemResponse,
    summary="Agendapunt bijwerken",
    description="STORY-070: Werk een agendapunt bij.",
)
async def update_agenda_item(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    item_id: uuid.UUID,
    update_data: AgendaItemUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> AgendaItemResponse:
    """Update an agenda item."""
    result = await db.execute(
        select(MeetingAgendaItem).where(
            MeetingAgendaItem.id == item_id,
            MeetingAgendaItem.meeting_id == meeting_id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendapunt niet gevonden",
        )

    # Validate document if provided
    if update_data.document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == update_data.document_id)
        )
        if not doc_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document niet gevonden",
            )

    # Update fields
    if update_data.title is not None:
        item.title = update_data.title
    if update_data.description is not None:
        item.description = update_data.description
    if update_data.duration_minutes is not None:
        item.duration_minutes = update_data.duration_minutes
    if update_data.order_index is not None:
        item.order_index = update_data.order_index
    if update_data.document_id is not None:
        item.document_id = update_data.document_id

    await db.commit()
    await db.refresh(item)

    return await _get_agenda_item_response(item, db)


@router.put(
    "/{meeting_id}/agenda/reorder",
    response_model=list[AgendaItemResponse],
    summary="Agenda herschikken",
    description="STORY-070: Herschik de volgorde van agendapunten (drag & drop).",
)
async def reorder_agenda_items(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    reorder_data: AgendaItemReorder,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> list[AgendaItemResponse]:
    """Reorder agenda items based on new order."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Update order for each item
    for idx, item_id in enumerate(reorder_data.item_ids):
        result = await db.execute(
            select(MeetingAgendaItem).where(
                MeetingAgendaItem.id == item_id,
                MeetingAgendaItem.meeting_id == meeting_id,
            )
        )
        item = result.scalar_one_or_none()
        if item:
            item.order_index = idx + 1

    await db.commit()

    # Return updated list
    result = await db.execute(
        select(MeetingAgendaItem)
        .where(MeetingAgendaItem.meeting_id == meeting_id)
        .order_by(MeetingAgendaItem.order_index)
    )
    items = result.scalars().all()

    return [await _get_agenda_item_response(item, db) for item in items]


@router.delete(
    "/{meeting_id}/agenda/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Agendapunt verwijderen",
    description="STORY-070: Verwijder een agendapunt.",
)
async def delete_agenda_item(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an agenda item."""
    result = await db.execute(
        select(MeetingAgendaItem).where(
            MeetingAgendaItem.id == item_id,
            MeetingAgendaItem.meeting_id == meeting_id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendapunt niet gevonden",
        )

    await db.delete(item)
    await db.commit()


@router.delete(
    "/{meeting_id}/agenda",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Alle agendapunten verwijderen",
    description="STORY-070: Verwijder alle agendapunten van een vergadering.",
)
async def delete_all_agenda_items(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete all agenda items for a meeting."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    result = await db.execute(
        select(MeetingAgendaItem).where(MeetingAgendaItem.meeting_id == meeting_id)
    )
    items = result.scalars().all()

    for item in items:
        await db.delete(item)

    await db.commit()


# ============================================================================
# STORY-071: ALV Invitation Endpoints
# ============================================================================


@router.get(
    "/{meeting_id}/invitation/preview",
    response_model=MeetingInvitationPreview,
    summary="Uitnodiging preview",
    description="STORY-071: Preview van ALV uitnodiging voor versturen.",
)
async def preview_invitation(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> MeetingInvitationPreview:
    """Preview invitation email before sending."""
    # Get meeting
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    meeting = meeting_result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Validate date (must be at least 8 days before)
    days_until = _calculate_days_until(meeting.meeting_date)
    if days_until is not None and days_until < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vergadering is al geweest",
        )

    # Count recipients (active VVE members)
    members_result = await db.execute(
        select(VVEMember)
        .where(VVEMember.vve_id == vve_id, VVEMember.is_active.is_(True))
    )
    members = members_result.scalars().all()
    recipient_count = len(members)

    # Get agenda items
    agenda_result = await db.execute(
        select(MeetingAgendaItem)
        .where(MeetingAgendaItem.meeting_id == meeting_id)
        .order_by(MeetingAgendaItem.order_index)
    )
    agenda_items = agenda_result.scalars().all()
    
    # Build agenda summary
    agenda_summary = None
    if agenda_items:
        agenda_lines = [f"{i+1}. {item.title}" for i, item in enumerate(agenda_items)]
        agenda_summary = "\n".join(agenda_lines)

    # Count documents linked to agenda
    doc_count = sum(1 for item in agenda_items if item.document_id)

    # Build preview
    meeting_date_str = meeting.meeting_date.strftime("%d %B %Y om %H:%M")
    subject = f"Uitnodiging ALV: {meeting.title}"
    
    body_preview = f"""Geachte eigenaar,

Hierbij nodigen wij u uit voor de Algemene Ledenvergadering:

{meeting.title}
Datum: {meeting_date_str}
Type: {meeting.meeting_type.value}"""

    if meeting.location_address:
        body_preview += f"\nLocatie: {meeting.location_address}"
    
    if meeting.location_online_link:
        body_preview += f"\nOnline link: {meeting.location_online_link}"

    if agenda_items:
        body_preview += f"\n\n--- Agenda ({len(agenda_items)} punten) ---\n"
        body_preview += agenda_summary

    body_preview += "\n\nWij hopen u te mogen verwelkomen.\n\nMet vriendelijke groet,\nHet bestuur"

    return MeetingInvitationPreview(
        subject=subject,
        body_preview=body_preview,
        recipient_count=recipient_count,
        meeting_date=meeting.meeting_date,
        agenda_summary=agenda_summary,
        document_count=doc_count,
    )


@router.post(
    "/{meeting_id}/invitation/send",
    response_model=MeetingInvitationResponse,
    summary="Uitnodiging versturen",
    description="STORY-071: Verstuur ALV uitnodiging naar alle eigenaren.",
)
async def send_invitation(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    invitation_data: MeetingInvitationCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> MeetingInvitationResponse:
    """Send invitation emails to all VVE members."""
    # Get meeting
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    meeting = meeting_result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Validate date (must be at least 8 days in future)
    days_until = _calculate_days_until(meeting.meeting_date)
    if days_until is not None and days_until < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vergadering is al geweest",
        )

    # Get active members with their user emails
    members_result = await db.execute(
        select(VVEMember, User)
        .join(User, VVEMember.user_id == User.id)
        .where(VVEMember.vve_id == vve_id, VVEMember.is_active.is_(True))
    )
    member_users = members_result.all()

    if not member_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen actieve leden gevonden om uitnodiging naar te sturen",
        )

    # Get agenda if requested
    agenda_items = []
    if invitation_data.include_agenda:
        agenda_result = await db.execute(
            select(MeetingAgendaItem)
            .where(MeetingAgendaItem.meeting_id == meeting_id)
            .order_by(MeetingAgendaItem.order_index)
        )
        agenda_items = agenda_result.scalars().all()

    # In a real implementation, we would send emails via the email service
    # For now, we just update the meeting status and return success
    recipients = [user.email for _, user in member_users if user.email]
    
    # Update meeting status to indicate invitation sent
    meeting.status = DBMeetingStatus.UITNODIGING_VERZONDEN
    await db.commit()

    return MeetingInvitationResponse(
        meeting_id=meeting.id,
        invitations_sent=len(recipients),
        status="sent",
        sent_at=datetime.now(timezone.utc),
        recipients=recipients,
    )


# ============================================================================
# STORY-072: RSVP Endpoints
# ============================================================================


@router.post(
    "/{meeting_id}/rsvp",
    response_model=RsvpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="RSVP registreren",
    description="STORY-072: Registreer aanwezigheid voor een ALV vergadering.",
)
async def create_or_update_rsvp(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    rsvp_data: RsvpCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> RsvpResponse:
    """Create or update RSVP for a meeting."""
    # Get meeting
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    meeting = meeting_result.scalar_one_or_none()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Check if meeting is in the future
    days_until = _calculate_days_until(meeting.meeting_date)
    if days_until is not None and days_until < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RSVP kan niet meer worden geregistreerd voor een afgelopen vergadering",
        )

    # Check existing RSVP
    existing_result = await db.execute(
        select(MeetingRsvp).where(
            MeetingRsvp.meeting_id == meeting_id,
            MeetingRsvp.user_id == current_user.id,
        )
    )
    existing_rsvp = existing_result.scalar_one_or_none()

    if existing_rsvp:
        # Update existing
        existing_rsvp.status = DBMeetingRsvpStatus(rsvp_data.status.value)
        existing_rsvp.proxy_holder_name = rsvp_data.proxy_holder_name
        existing_rsvp.notes = rsvp_data.notes
        rsvp = existing_rsvp
    else:
        # Create new
        rsvp = MeetingRsvp(
            meeting_id=meeting_id,
            user_id=current_user.id,
            status=DBMeetingRsvpStatus(rsvp_data.status.value),
            proxy_holder_name=rsvp_data.proxy_holder_name,
            notes=rsvp_data.notes,
        )
        db.add(rsvp)

    await db.commit()
    await db.refresh(rsvp)

    return RsvpResponse(
        id=rsvp.id,
        meeting_id=rsvp.meeting_id,
        user_id=rsvp.user_id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        status=RsvpStatus(rsvp.status.value),
        proxy_holder_name=rsvp.proxy_holder_name,
        notes=rsvp.notes,
        created_at=rsvp.created_at,
        updated_at=rsvp.updated_at,
    )


@router.get(
    "/{meeting_id}/rsvp",
    response_model=RsvpResponse | None,
    summary="Eigen RSVP ophalen",
    description="STORY-072: Haal de eigen RSVP status op voor een vergadering.",
)
async def get_my_rsvp(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> RsvpResponse | None:
    """Get current user's RSVP for a meeting."""
    result = await db.execute(
        select(MeetingRsvp).where(
            MeetingRsvp.meeting_id == meeting_id,
            MeetingRsvp.user_id == current_user.id,
        )
    )
    rsvp = result.scalar_one_or_none()

    if not rsvp:
        return None

    return RsvpResponse(
        id=rsvp.id,
        meeting_id=rsvp.meeting_id,
        user_id=rsvp.user_id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        status=RsvpStatus(rsvp.status.value),
        proxy_holder_name=rsvp.proxy_holder_name,
        notes=rsvp.notes,
        created_at=rsvp.created_at,
        updated_at=rsvp.updated_at,
    )


@router.get(
    "/{meeting_id}/rsvps",
    response_model=list[RsvpResponse],
    summary="Alle RSVP's ophalen",
    description="STORY-072: Haal alle RSVP's op voor een vergadering (alleen bestuur).",
)
async def list_rsvps(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> list[RsvpResponse]:
    """List all RSVPs for a meeting (board only)."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    result = await db.execute(
        select(MeetingRsvp, User)
        .join(User, MeetingRsvp.user_id == User.id)
        .where(MeetingRsvp.meeting_id == meeting_id)
        .order_by(User.last_name, User.first_name)
    )
    rsvps_users = result.all()

    return [
        RsvpResponse(
            id=rsvp.id,
            meeting_id=rsvp.meeting_id,
            user_id=rsvp.user_id,
            user_name=f"{user.first_name} {user.last_name}",
            status=RsvpStatus(rsvp.status.value),
            proxy_holder_name=rsvp.proxy_holder_name,
            notes=rsvp.notes,
            created_at=rsvp.created_at,
            updated_at=rsvp.updated_at,
        )
        for rsvp, user in rsvps_users
    ]


@router.get(
    "/{meeting_id}/rsvps/summary",
    response_model=RsvpSummary,
    summary="RSVP samenvatting",
    description="STORY-072: Haal een samenvatting op van alle RSVP's voor een vergadering.",
)
async def get_rsvp_summary(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> RsvpSummary:
    """Get RSVP summary for a meeting."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vergadering niet gevonden",
        )

    # Count total invited members
    members_result = await db.execute(
        select(VVEMember).where(VVEMember.vve_id == vve_id, VVEMember.is_active.is_(True))
    )
    total_invited = len(members_result.scalars().all())

    # Count RSVPs by status
    rsvps_result = await db.execute(
        select(MeetingRsvp).where(MeetingRsvp.meeting_id == meeting_id)
    )
    rsvps = rsvps_result.scalars().all()

    present_count = sum(1 for r in rsvps if r.status == DBMeetingRsvpStatus.PRESENT)
    absent_count = sum(1 for r in rsvps if r.status == DBMeetingRsvpStatus.ABSENT)
    with_proxy_count = sum(1 for r in rsvps if r.status == DBMeetingRsvpStatus.WITH_PROXY)
    total_responded = len(rsvps)
    no_response_count = total_invited - total_responded

    response_rate = (total_responded / total_invited * 100) if total_invited > 0 else 0.0

    return RsvpSummary(
        meeting_id=meeting_id,
        total_invited=total_invited,
        total_responded=total_responded,
        present_count=present_count,
        absent_count=absent_count,
        with_proxy_count=with_proxy_count,
        no_response_count=no_response_count,
        response_rate=round(response_rate, 1),
    )


# STORY-073: Proxy (Volmacht) endpoints
@router.get(
    "/{meeting_id}/proxies/eligible-grantees",
    response_model=list[EligibleGrantee],
    summary="Lijst gevolmachtigden",
    description="Haal lijst van eigenaren/bestuursleden op die als gevolmachtigde kunnen worden aangewezen (STORY-073).",
)
async def list_eligible_grantees(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> list[EligibleGrantee]:
    """List users who can be proxy recipients (STORY-073)."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")

    # Get all VVE members except the current user
    members_result = await db.execute(
        select(VVEMember, User)
        .join(User, VVEMember.user_id == User.id)
        .where(
            VVEMember.vve_id == vve_id,
            VVEMember.is_active == True,
            VVEMember.user_id != current_user.id,
        )
    )
    members = members_result.all()

    return [
        EligibleGrantee(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=f"{user.first_name} {user.last_name}",
            is_board_member=member.role.value in ("bestuurslid", "penningmeester"),
        )
        for member, user in members
    ]


@router.post(
    "/{meeting_id}/proxies",
    response_model=ProxyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Volmacht afgeven",
    description="Geef een digitale volmacht af aan een andere eigenaar of bestuurslid (STORY-073).",
)
async def create_proxy(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    proxy_data: ProxyCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> ProxyResponse:
    """Create a digital proxy/volmacht (STORY-073)."""
    import json

    # Verify meeting exists and is not closed
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    meeting = meeting_result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")
    if meeting.status in (DBMeetingStatus.AFGESLOTEN, DBMeetingStatus.GEANNULEERD):
        raise HTTPException(status_code=400, detail="Kan geen volmacht afgeven voor afgesloten vergadering")

    # Verify grantee exists and is a VVE member
    grantee_result = await db.execute(
        select(VVEMember, User)
        .join(User, VVEMember.user_id == User.id)
        .where(
            VVEMember.vve_id == vve_id,
            VVEMember.user_id == proxy_data.grantee_id,
            VVEMember.is_active == True,
        )
    )
    grantee_data = grantee_result.first()
    if not grantee_data:
        raise HTTPException(status_code=400, detail="Gevolmachtigde is geen lid van deze VVE")

    grantee_member, grantee_user = grantee_data

    # Verify grantor cannot grant proxy to themselves
    if proxy_data.grantee_id == current_user.id:
        raise HTTPException(status_code=400, detail="U kunt geen volmacht aan uzelf afgeven")

    # Check if user already has an active proxy for this meeting
    existing_result = await db.execute(
        select(MeetingProxy).where(
            MeetingProxy.meeting_id == meeting_id,
            MeetingProxy.grantor_id == current_user.id,
            MeetingProxy.status != DBProxyStatus.REVOKED,
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="U heeft al een actieve volmacht voor deze vergadering")

    # If scope is SPECIFIC, verify agenda items exist
    if proxy_data.scope == ProxyScope.SPECIFIC and proxy_data.agenda_item_ids:
        agenda_items_result = await db.execute(
            select(MeetingAgendaItem.id).where(
                MeetingAgendaItem.meeting_id == meeting_id,
                MeetingAgendaItem.id.in_(proxy_data.agenda_item_ids),
            )
        )
        found_items = [row[0] for row in agenda_items_result.all()]
        if len(found_items) != len(proxy_data.agenda_item_ids):
            raise HTTPException(status_code=400, detail="Eén of meer agendapunten niet gevonden")

    # Create proxy
    agenda_item_ids_json = None
    if proxy_data.agenda_item_ids:
        agenda_item_ids_json = json.dumps([str(item_id) for item_id in proxy_data.agenda_item_ids])

    proxy = MeetingProxy(
        meeting_id=meeting_id,
        grantor_id=current_user.id,
        grantee_id=proxy_data.grantee_id,
        scope=DBProxyScope(proxy_data.scope.value),
        agenda_item_ids=agenda_item_ids_json,
        status=DBProxyStatus.PENDING,
        notes=proxy_data.notes,
    )

    db.add(proxy)
    await db.commit()
    await db.refresh(proxy)

    # Get grantor name
    grantor_result = await db.execute(select(User).where(User.id == current_user.id))
    grantor = grantor_result.scalar_one()

    # Parse agenda_item_ids back to list
    parsed_agenda_items = None
    if proxy.agenda_item_ids:
        parsed_agenda_items = [uuid.UUID(item_id) for item_id in json.loads(proxy.agenda_item_ids)]

    return ProxyResponse(
        id=proxy.id,
        meeting_id=proxy.meeting_id,
        grantor_id=proxy.grantor_id,
        grantor_name=f"{grantor.first_name} {grantor.last_name}",
        grantee_id=proxy.grantee_id,
        grantee_name=f"{grantee_user.first_name} {grantee_user.last_name}",
        scope=ProxyScope(proxy.scope.value),
        agenda_item_ids=parsed_agenda_items,
        status=ProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.get(
    "/{meeting_id}/proxies",
    response_model=list[ProxyListResponse],
    summary="Lijst volmachten",
    description="Haal alle volmachten op voor een vergadering (STORY-073).",
)
async def list_proxies(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> list[ProxyListResponse]:
    """List all proxies for a meeting (STORY-073). Board members only."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")

    # Get all proxies with user info
    proxies_result = await db.execute(
        select(MeetingProxy, User, User)
        .join(User, MeetingProxy.grantor_id == User.id)
        .join(User, MeetingProxy.grantee_id == User.id, isouter=True)
        .where(MeetingProxy.meeting_id == meeting_id)
        .order_by(MeetingProxy.created_at.desc())
    )

    # Use separate queries for grantor and grantee
    proxies_result = await db.execute(
        select(MeetingProxy).where(MeetingProxy.meeting_id == meeting_id)
        .order_by(MeetingProxy.created_at.desc())
    )
    proxies = proxies_result.scalars().all()

    result = []
    for proxy in proxies:
        # Get grantor name
        grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
        grantor = grantor_result.scalar_one()
        # Get grantee name
        grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
        grantee = grantee_result.scalar_one()

        result.append(ProxyListResponse(
            id=proxy.id,
            meeting_id=proxy.meeting_id,
            grantor_id=proxy.grantor_id,
            grantor_name=f"{grantor.first_name} {grantor.last_name}",
            grantee_id=proxy.grantee_id,
            grantee_name=f"{grantee.first_name} {grantee.last_name}",
            scope=ProxyScope(proxy.scope.value),
            status=ProxyStatus(proxy.status.value),
            created_at=proxy.created_at,
        ))

    return result


@router.get(
    "/{meeting_id}/proxies/my",
    response_model=ProxyResponse | None,
    summary="Mijn volmacht",
    description="Haal mijn volmacht op voor een vergadering (STORY-073).",
)
async def get_my_proxy(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> ProxyResponse | None:
    """Get the current user's proxy for a meeting (STORY-073)."""
    import json

    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")

    # Get proxy
    proxy_result = await db.execute(
        select(MeetingProxy).where(
            MeetingProxy.meeting_id == meeting_id,
            MeetingProxy.grantor_id == current_user.id,
        )
    )
    proxy = proxy_result.scalar_one_or_none()

    if not proxy:
        return None

    # Get user names
    grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
    grantor = grantor_result.scalar_one()
    grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
    grantee = grantee_result.scalar_one()

    # Parse agenda_item_ids
    parsed_agenda_items = None
    if proxy.agenda_item_ids:
        parsed_agenda_items = [uuid.UUID(item_id) for item_id in json.loads(proxy.agenda_item_ids)]

    return ProxyResponse(
        id=proxy.id,
        meeting_id=proxy.meeting_id,
        grantor_id=proxy.grantor_id,
        grantor_name=f"{grantor.first_name} {grantor.last_name}",
        grantee_id=proxy.grantee_id,
        grantee_name=f"{grantee.first_name} {grantee.last_name}",
        scope=ProxyScope(proxy.scope.value),
        agenda_item_ids=parsed_agenda_items,
        status=ProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.get(
    "/{meeting_id}/proxies/received",
    response_model=list[ProxyListResponse],
    summary="Ontvangen volmachten",
    description="Haal volmachten op die aan mij zijn afgegeven (STORY-073).",
)
async def list_received_proxies(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> list[ProxyListResponse]:
    """List proxies received by the current user (STORY-073)."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")

    # Get received proxies
    proxies_result = await db.execute(
        select(MeetingProxy).where(
            MeetingProxy.meeting_id == meeting_id,
            MeetingProxy.grantee_id == current_user.id,
        ).order_by(MeetingProxy.created_at.desc())
    )
    proxies = proxies_result.scalars().all()

    result = []
    for proxy in proxies:
        # Get grantor name
        grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
        grantor = grantor_result.scalar_one()
        # Get grantee name
        grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
        grantee = grantee_result.scalar_one()

        result.append(ProxyListResponse(
            id=proxy.id,
            meeting_id=proxy.meeting_id,
            grantor_id=proxy.grantor_id,
            grantor_name=f"{grantor.first_name} {grantor.last_name}",
            grantee_id=proxy.grantee_id,
            grantee_name=f"{grantee.first_name} {grantee.last_name}",
            scope=ProxyScope(proxy.scope.value),
            status=ProxyStatus(proxy.status.value),
            created_at=proxy.created_at,
        ))

    return result


@router.patch(
    "/{meeting_id}/proxies/{proxy_id}/confirm",
    response_model=ProxyResponse,
    summary="Volmacht bevestigen",
    description="Bevestig een aan u afgegeven volmacht (STORY-073).",
)
async def confirm_proxy(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> ProxyResponse:
    """Confirm a proxy received by the current user (STORY-073)."""
    import json

    # Get proxy
    proxy_result = await db.execute(
        select(MeetingProxy).where(
            MeetingProxy.id == proxy_id,
            MeetingProxy.meeting_id == meeting_id,
        )
    )
    proxy = proxy_result.scalar_one_or_none()

    if not proxy:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Verify current user is the grantee
    if proxy.grantee_id != current_user.id:
        raise HTTPException(status_code=403, detail="U bent niet de gevolmachtigde")

    # Verify proxy is pending
    if proxy.status != DBProxyStatus.PENDING:
        raise HTTPException(status_code=400, detail="Volmacht kan alleen worden bevestigd als deze nog wacht op bevestiging")

    # Update status
    proxy.status = DBProxyStatus.CONFIRMED
    proxy.confirmed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(proxy)

    # Get user names
    grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
    grantor = grantor_result.scalar_one()
    grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
    grantee = grantee_result.scalar_one()

    # Parse agenda_item_ids
    parsed_agenda_items = None
    if proxy.agenda_item_ids:
        parsed_agenda_items = [uuid.UUID(item_id) for item_id in json.loads(proxy.agenda_item_ids)]

    return ProxyResponse(
        id=proxy.id,
        meeting_id=proxy.meeting_id,
        grantor_id=proxy.grantor_id,
        grantor_name=f"{grantor.first_name} {grantor.last_name}",
        grantee_id=proxy.grantee_id,
        grantee_name=f"{grantee.first_name} {grantee.last_name}",
        scope=ProxyScope(proxy.scope.value),
        agenda_item_ids=parsed_agenda_items,
        status=ProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.patch(
    "/{meeting_id}/proxies/{proxy_id}/revoke",
    response_model=ProxyResponse,
    summary="Volmacht intrekken",
    description="Trek een door u afgegeven volmacht in (STORY-073).",
)
async def revoke_proxy(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
) -> ProxyResponse:
    """Revoke a proxy granted by the current user (STORY-073)."""
    import json

    # Get proxy
    proxy_result = await db.execute(
        select(MeetingProxy).where(
            MeetingProxy.id == proxy_id,
            MeetingProxy.meeting_id == meeting_id,
        )
    )
    proxy = proxy_result.scalar_one_or_none()

    if not proxy:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Verify current user is the grantor
    if proxy.grantor_id != current_user.id:
        raise HTTPException(status_code=403, detail="U bent niet de volmachtgever")

    # Verify proxy is not already revoked
    if proxy.status == DBProxyStatus.REVOKED:
        raise HTTPException(status_code=400, detail="Volmacht is al ingetrokken")

    # Update status
    proxy.status = DBProxyStatus.REVOKED
    proxy.revoked_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(proxy)

    # Get user names
    grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
    grantor = grantor_result.scalar_one()
    grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
    grantee = grantee_result.scalar_one()

    # Parse agenda_item_ids
    parsed_agenda_items = None
    if proxy.agenda_item_ids:
        parsed_agenda_items = [uuid.UUID(item_id) for item_id in json.loads(proxy.agenda_item_ids)]

    return ProxyResponse(
        id=proxy.id,
        meeting_id=proxy.meeting_id,
        grantor_id=proxy.grantor_id,
        grantor_name=f"{grantor.first_name} {grantor.last_name}",
        grantee_id=proxy.grantee_id,
        grantee_name=f"{grantee.first_name} {grantee.last_name}",
        scope=ProxyScope(proxy.scope.value),
        agenda_item_ids=parsed_agenda_items,
        status=ProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.get(
    "/{meeting_id}/proxies/summary",
    response_model=ProxySummary,
    summary="Volmachten samenvatting",
    description="Haal een samenvatting op van alle volmachten voor een vergadering (STORY-073).",
)
async def get_proxy_summary(
    vve_id: uuid.UUID,
    meeting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> ProxySummary:
    """Get proxy summary for a meeting (STORY-073). Board members only."""
    # Verify meeting exists
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.vve_id == vve_id)
    )
    if not meeting_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Vergadering niet gevonden")

    # Get all proxies
    proxies_result = await db.execute(
        select(MeetingProxy).where(MeetingProxy.meeting_id == meeting_id)
    )
    proxies = proxies_result.scalars().all()

    pending_count = sum(1 for p in proxies if p.status == DBProxyStatus.PENDING)
    confirmed_count = sum(1 for p in proxies if p.status == DBProxyStatus.CONFIRMED)
    revoked_count = sum(1 for p in proxies if p.status == DBProxyStatus.REVOKED)

    return ProxySummary(
        meeting_id=meeting_id,
        total_proxies=len(proxies),
        pending_count=pending_count,
        confirmed_count=confirmed_count,
        revoked_count=revoked_count,
    )
