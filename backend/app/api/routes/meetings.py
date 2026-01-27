"""Meeting/ALV API routes.

Implements EPIC-015 (ALV & Vergaderbeheer), FEAT-032 (ALV Planning & Uitnodigingen),
and STORY-069 (ALV plannen met datum en locatie).
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
)
from app.db.models.models import (
    Meeting,
    MeetingStatus as DBMeetingStatus,
    MeetingType as DBMeetingType,
    User,
)
from app.db.session import get_db
from app.schemas.meeting import (
    MeetingCreate,
    MeetingListResponse,
    MeetingResponse,
    MeetingStatus,
    MeetingType,
    MeetingUpdate,
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
