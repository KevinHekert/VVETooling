"""Ticket API routes.

Implements FEAT-016 (Bewoner tickets & klachten) and STORY-029 (Bewoner ticket wizard en tijdlijn).
Implements STORY-030: Ticket bewijsstukken (bonnen en facturen).
Implements STORY-037: Ticket communicatie en notities.
Implements STORY-044: Ticket supplier collaboration status.
"""

import os
import re
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.core.security import UserRole
from app.db.models.models import (
    Supplier,
    SupplierFollowUp,
    SupplierFollowUpChannel as DBSupplierFollowUpChannel,
    SupplierStatus as DBSupplierStatus,
    Ticket,
    TicketAttachment,
    TicketAttachmentStatus as DBTicketAttachmentStatus,
    TicketCategory,
    TicketComment,
    TicketPriority,
    TicketStatus,
    TicketTimelineEntry,
    Unit,
    User,
    VVE,
    VVEMember,
)
from app.db.session import get_db
from app.schemas.ticket import (
    SupplierCreate,
    SupplierFollowUpChannel,
    SupplierFollowUpCreate,
    SupplierFollowUpResponse,
    SupplierResponse,
    SupplierStatus,
    SupplierUpdate,
    TicketAttachmentResponse,
    TicketAttachmentStatus,
    TicketAttachmentUpdate,
    TicketCommentCreate,
    TicketCommentResponse,
    TicketCommentUpdate,
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketSummary,
    TicketSupplierStatusUpdate,
    TicketTimelineEntryResponse,
    TicketUpdate,
    ALLOWED_ATTACHMENT_TYPES,
    MAX_ATTACHMENT_SIZE_BYTES,
)

router = APIRouter(prefix="/vves/{vve_id}/tickets", tags=["tickets"])


def _sanitize_filename(filename: str | None) -> str:
    """Sanitize a filename to prevent path traversal attacks.
    
    Removes path separators and special characters, keeping only safe characters.
    """
    if not filename:
        return "unknown"
    
    # Get only the base filename (remove any path)
    filename = os.path.basename(filename)
    
    # Remove or replace potentially dangerous characters
    # Keep only alphanumeric, dots, hyphens, and underscores
    sanitized = re.sub(r'[^\w\.\-]', '_', filename)
    
    # Prevent empty filenames or files starting with dot
    if not sanitized or sanitized.startswith('.'):
        sanitized = f"file_{sanitized}"
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized


async def _create_timeline_entry(
    db: AsyncSession,
    ticket_id: uuid.UUID,
    actor_id: uuid.UUID,
    action: str,
    description: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
) -> TicketTimelineEntry:
    """Create a timeline entry for a ticket."""
    entry = TicketTimelineEntry(
        ticket_id=ticket_id,
        actor_id=actor_id,
        action=action,
        description=description,
        old_value=old_value,
        new_value=new_value,
    )
    db.add(entry)
    return entry


async def _get_user_unit_for_vve(
    db: AsyncSession, user_id: uuid.UUID, vve_id: uuid.UUID
) -> Unit | None:
    """Get the unit associated with a user in a VVE."""
    result = await db.execute(
        select(Unit)
        .join(VVEMember, VVEMember.unit_id == Unit.id)
        .where(
            VVEMember.user_id == user_id,
            VVEMember.vve_id == vve_id,
            VVEMember.is_active.is_(True),
        )
    )
    return result.scalar_one_or_none()


@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Nieuw ticket aanmaken",
    description="""
    STORY-029: Als bewoner wil ik een ticket-wizard kunnen doorlopen om een klacht in te dienen.

    - Ticket wordt gekoppeld aan de unit van de bewoner
    - Initiele status is 'submitted'
    - Tijdlijn wordt automatisch aangemaakt
    """,
)
async def create_ticket(
    vve_id: uuid.UUID,
    ticket_data: TicketCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketResponse:
    """Create a new ticket.

    Requires member role. Ticket is linked to the user's unit.
    """
    # Validate VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Get user's unit in this VVE
    unit = await _get_user_unit_for_vve(db, current_user.id, vve_id)
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen unit gevonden voor uw account in deze VVE",
        )

    # Create ticket
    ticket = Ticket(
        vve_id=vve_id,
        unit_id=unit.id,
        submitted_by_id=current_user.id,
        title=ticket_data.title,
        description=ticket_data.description,
        category=TicketCategory(ticket_data.category.value),
        location=ticket_data.location,
        priority=TicketPriority(ticket_data.priority.value) if ticket_data.priority else TicketPriority.MEDIUM,
        status=TicketStatus.SUBMITTED,
    )
    db.add(ticket)
    await db.flush()

    # Create initial timeline entry
    await _create_timeline_entry(
        db,
        ticket.id,
        current_user.id,
        "created",
        f"Ticket aangemaakt: {ticket_data.title}",
        new_value="submitted",
    )

    await db.commit()
    await db.refresh(ticket, ["attachments", "timeline"])

    response = TicketResponse.model_validate(ticket)
    response.submitted_by_name = current_user.full_name
    return response


@router.get(
    "",
    response_model=list[TicketListResponse],
    summary="Tickets ophalen",
    description="""
    STORY-029: Bewoner ziet alleen eigen tickets.
    STORY-031: Bestuur ziet alle tickets van de VVE.
    """,
)
async def list_tickets(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: TicketStatus | None = None,
    category_filter: TicketCategory | None = None,
    priority_filter: TicketPriority | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[TicketListResponse]:
    """Get tickets for a VVE.

    Bewoners see only their own tickets.
    Bestuurslid/beheerder see all tickets.
    """
    query = select(Ticket).where(Ticket.vve_id == vve_id)

    # Filter by role: bewoners only see their own tickets
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner":
        query = query.where(Ticket.submitted_by_id == current_user.id)

    # Apply filters
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    if category_filter:
        query = query.where(Ticket.category == category_filter)
    if priority_filter:
        query = query.where(Ticket.priority == priority_filter)

    query = query.order_by(Ticket.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    tickets = result.scalars().all()

    # Get counts for each ticket
    ticket_responses = []
    for ticket in tickets:
        # Get attachment count
        attachment_count_result = await db.execute(
            select(func.count(TicketAttachment.id)).where(
                TicketAttachment.ticket_id == ticket.id
            )
        )
        attachment_count = attachment_count_result.scalar() or 0

        # Get comment count
        comment_count_result = await db.execute(
            select(func.count(TicketComment.id)).where(
                TicketComment.ticket_id == ticket.id
            )
        )
        comment_count = comment_count_result.scalar() or 0

        # Get submitter name
        submitter_result = await db.execute(
            select(User).where(User.id == ticket.submitted_by_id)
        )
        submitter = submitter_result.scalar_one_or_none()

        response = TicketListResponse(
            id=ticket.id,
            vve_id=ticket.vve_id,
            unit_id=ticket.unit_id,
            submitted_by_id=ticket.submitted_by_id,
            submitted_by_name=f"{submitter.first_name} {submitter.last_name}" if submitter else None,
            title=ticket.title,
            category=ticket.category,
            status=ticket.status,
            priority=ticket.priority,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            attachment_count=attachment_count,
            comment_count=comment_count,
        )
        ticket_responses.append(response)

    return ticket_responses


@router.get(
    "/summary",
    response_model=TicketSummary,
    summary="Ticket statistieken ophalen",
)
async def get_ticket_summary(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketSummary:
    """Get ticket statistics for a VVE.

    Requires bestuurslid or beheerder role.
    """
    # Get total count
    total_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.vve_id == vve_id)
    )
    total_tickets = total_result.scalar() or 0

    # Get counts by status
    open_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.vve_id == vve_id,
            Ticket.status.in_([TicketStatus.SUBMITTED, TicketStatus.AWAITING_INFO]),
        )
    )
    open_tickets = open_result.scalar() or 0

    in_progress_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.vve_id == vve_id,
            Ticket.status == TicketStatus.IN_PROGRESS,
        )
    )
    in_progress_tickets = in_progress_result.scalar() or 0

    resolved_result = await db.execute(
        select(func.count(Ticket.id)).where(
            Ticket.vve_id == vve_id,
            Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
        )
    )
    resolved_tickets = resolved_result.scalar() or 0

    # Get counts by category
    by_category = {}
    for category in TicketCategory:
        cat_result = await db.execute(
            select(func.count(Ticket.id)).where(
                Ticket.vve_id == vve_id,
                Ticket.category == category,
            )
        )
        count = cat_result.scalar() or 0
        if count > 0:
            by_category[category.value] = count

    # Get counts by priority
    by_priority = {}
    for priority in TicketPriority:
        pri_result = await db.execute(
            select(func.count(Ticket.id)).where(
                Ticket.vve_id == vve_id,
                Ticket.priority == priority,
            )
        )
        count = pri_result.scalar() or 0
        if count > 0:
            by_priority[priority.value] = count

    return TicketSummary(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        resolved_tickets=resolved_tickets,
        by_category=by_category,
        by_priority=by_priority,
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
    summary="Ticket details ophalen",
)
async def get_ticket(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketResponse:
    """Get ticket details by ID."""
    result = await db.execute(
        select(Ticket)
        .options(
            selectinload(Ticket.attachments),
            selectinload(Ticket.timeline),
        )
        .where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access: bewoners can only see their own tickets
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner" and ticket.submitted_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Get submitter name
    submitter_result = await db.execute(
        select(User).where(User.id == ticket.submitted_by_id)
    )
    submitter = submitter_result.scalar_one_or_none()

    response = TicketResponse.model_validate(ticket)
    response.submitted_by_name = f"{submitter.first_name} {submitter.last_name}" if submitter else None
    return response


@router.put(
    "/{ticket_id}",
    response_model=TicketResponse,
    summary="Ticket bijwerken",
)
async def update_ticket(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    update_data: TicketUpdate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketResponse:
    """Update a ticket.

    Bewoners can update their own tickets (except status).
    Bestuurslid/beheerder can update any ticket including status.
    """
    result = await db.execute(
        select(Ticket)
        .options(
            selectinload(Ticket.attachments),
            selectinload(Ticket.timeline),
        )
        .where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access and permissions
    user_role = current_user.get_role_for_vve(vve_id)
    is_owner = ticket.submitted_by_id == current_user.id
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder"]

    if not is_owner and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Bewoners cannot change status
    if update_data.status and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Alleen bestuur kan de status wijzigen",
        )

    # Track changes for timeline
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        old_value = getattr(ticket, field)
        if field == "status" and value:
            new_status = TicketStatus(value.value)
            if old_value != new_status:
                await _create_timeline_entry(
                    db,
                    ticket.id,
                    current_user.id,
                    "status_changed",
                    f"Status gewijzigd van {old_value.value} naar {new_status.value}",
                    old_value=old_value.value,
                    new_value=new_status.value,
                )
                setattr(ticket, field, new_status)
                if new_status == TicketStatus.RESOLVED:
                    ticket.resolved_at = func.now()
        elif field == "category" and value:
            new_category = TicketCategory(value.value)
            setattr(ticket, field, new_category)
        elif field == "priority" and value:
            new_priority = TicketPriority(value.value)
            setattr(ticket, field, new_priority)
        else:
            setattr(ticket, field, value)

    await db.commit()
    await db.refresh(ticket, ["attachments", "timeline"])

    return TicketResponse.model_validate(ticket)


# ============================================================================
# Attachment Endpoints (STORY-030)
# ============================================================================


@router.post(
    "/{ticket_id}/attachments",
    response_model=TicketAttachmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bewijsstuk uploaden",
    description="""
    STORY-030: Als bewoner wil ik bewijsstukken kunnen uploaden bij mijn ticket.

    - Maximum bestandsgrootte: 10MB per bestand
    - Toegestane formaten: PDF, JPEG, PNG, WebP
    """,
)
async def upload_attachment(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    file: Annotated[UploadFile, File(description="Bewijsstuk bestand")],
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    description: Annotated[str | None, Form(max_length=500)] = None,
) -> TicketAttachmentResponse:
    """Upload an attachment to a ticket."""
    # Get ticket
    result = await db.execute(
        select(Ticket).where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access
    user_role = current_user.get_role_for_vve(vve_id)
    is_owner = ticket.submitted_by_id == current_user.id
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder"]

    if not is_owner and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Validate file type
    if file.content_type not in ALLOWED_ATTACHMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestandstype '{file.content_type}' niet toegestaan. "
            f"Toegestane types: PDF, JPEG, PNG, WebP.",
        )

    # Read file content to check size
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_ATTACHMENT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bestand is te groot ({file_size / (1024*1024):.1f} MB). Maximum is 10 MB.",
        )

    # Sanitize filename to prevent path traversal attacks
    safe_filename = _sanitize_filename(file.filename)

    # Generate S3 key with UUID to prevent collisions
    s3_key = f"vves/{vve_id}/tickets/{ticket_id}/attachments/{uuid.uuid4()}/{safe_filename}"

    # Create attachment record
    attachment = TicketAttachment(
        ticket_id=ticket_id,
        file_name=safe_filename,
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        s3_key=s3_key,
        description=description,
        uploaded_by_id=current_user.id,
    )
    db.add(attachment)

    # Create timeline entry
    await _create_timeline_entry(
        db,
        ticket_id,
        current_user.id,
        "attachment_added",
        f"Bewijsstuk toegevoegd: {file.filename}",
    )

    await db.commit()
    await db.refresh(attachment)

    response = TicketAttachmentResponse.model_validate(attachment)
    response.uploaded_by_name = current_user.full_name
    return response


@router.get(
    "/{ticket_id}/attachments",
    response_model=list[TicketAttachmentResponse],
    summary="Bewijsstukken ophalen",
)
async def list_attachments(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[TicketAttachmentResponse]:
    """Get attachments for a ticket."""
    # Get ticket and check access
    result = await db.execute(
        select(Ticket).where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner" and ticket.submitted_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Get attachments
    attachments_result = await db.execute(
        select(TicketAttachment)
        .where(TicketAttachment.ticket_id == ticket_id)
        .order_by(TicketAttachment.created_at.desc())
    )
    attachments = attachments_result.scalars().all()

    return [TicketAttachmentResponse.model_validate(a) for a in attachments]


@router.put(
    "/{ticket_id}/attachments/{attachment_id}",
    response_model=TicketAttachmentResponse,
    summary="Bewijsstuk beoordelen",
    description="""
    STORY-030: Als bestuurslid wil ik bewijsstukken kunnen accepteren of afwijzen.

    - Status kan worden gewijzigd naar accepted of rejected
    - Bij afwijzing is een reden verplicht
    """,
)
async def update_attachment(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    attachment_id: uuid.UUID,
    update_data: TicketAttachmentUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketAttachmentResponse:
    """Update attachment status (accept/reject).

    Requires bestuurslid or beheerder role.
    """
    # Get attachment
    result = await db.execute(
        select(TicketAttachment)
        .join(Ticket)
        .where(
            TicketAttachment.id == attachment_id,
            TicketAttachment.ticket_id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    attachment = result.scalar_one_or_none()

    if attachment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bewijsstuk niet gevonden",
        )

    # Validate rejection reason
    if update_data.status == TicketAttachmentStatus.REJECTED and not update_data.rejection_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Een afwijzingsreden is verplicht",
        )

    # Update attachment
    if update_data.status:
        attachment.status = DBTicketAttachmentStatus(update_data.status.value)
        attachment.reviewed_by_id = current_user.id
        attachment.reviewed_at = func.now()

    if update_data.rejection_reason:
        attachment.rejection_reason = update_data.rejection_reason

    # Create timeline entry
    action_desc = "geaccepteerd" if update_data.status == TicketAttachmentStatus.ACCEPTED else "afgewezen"
    await _create_timeline_entry(
        db,
        ticket_id,
        current_user.id,
        "attachment_reviewed",
        f"Bewijsstuk '{attachment.file_name}' {action_desc}",
        new_value=update_data.status.value if update_data.status else None,
    )

    await db.commit()
    await db.refresh(attachment)

    response = TicketAttachmentResponse.model_validate(attachment)
    response.reviewed_by_name = current_user.full_name
    return response


# ============================================================================
# Comment Endpoints (STORY-037)
# ============================================================================


@router.post(
    "/{ticket_id}/comments",
    response_model=TicketCommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reactie toevoegen",
    description="""
    STORY-037: Als bewoner of bestuurslid wil ik reacties kunnen toevoegen aan een ticket.

    - Interne notities zijn alleen zichtbaar voor bestuur
    - Normale reacties zijn zichtbaar voor iedereen met toegang tot het ticket
    """,
)
async def add_comment(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    comment_data: TicketCommentCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketCommentResponse:
    """Add a comment to a ticket."""
    # Get ticket
    result = await db.execute(
        select(Ticket).where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access
    user_role = current_user.get_role_for_vve(vve_id)
    is_owner = ticket.submitted_by_id == current_user.id
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder"]

    if not is_owner and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Only staff can add internal comments
    if comment_data.is_internal and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Alleen bestuur kan interne notities toevoegen",
        )

    # Create comment
    comment = TicketComment(
        ticket_id=ticket_id,
        author_id=current_user.id,
        content=comment_data.content,
        is_internal=comment_data.is_internal,
    )
    db.add(comment)

    # Create timeline entry
    action = "internal_note_added" if comment_data.is_internal else "comment_added"
    await _create_timeline_entry(
        db,
        ticket_id,
        current_user.id,
        action,
        "Interne notitie toegevoegd" if comment_data.is_internal else "Reactie toegevoegd",
    )

    await db.commit()
    await db.refresh(comment)

    response = TicketCommentResponse.model_validate(comment)
    response.author_name = current_user.full_name
    return response


@router.get(
    "/{ticket_id}/comments",
    response_model=list[TicketCommentResponse],
    summary="Reacties ophalen",
)
async def list_comments(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[TicketCommentResponse]:
    """Get comments for a ticket.

    Internal comments are only visible to staff.
    """
    # Get ticket and check access
    result = await db.execute(
        select(Ticket).where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access
    user_role = current_user.get_role_for_vve(vve_id)
    is_owner = ticket.submitted_by_id == current_user.id
    is_staff = user_role and user_role.value in ["bestuurslid", "beheerder"]

    if not is_owner and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Get comments
    query = select(TicketComment).where(TicketComment.ticket_id == ticket_id)

    # Hide internal comments from non-staff
    if not is_staff:
        query = query.where(TicketComment.is_internal.is_(False))

    query = query.order_by(TicketComment.created_at.asc())

    comments_result = await db.execute(query)
    comments = comments_result.scalars().all()

    # Get author names
    responses = []
    for comment in comments:
        author_result = await db.execute(
            select(User).where(User.id == comment.author_id)
        )
        author = author_result.scalar_one_or_none()

        response = TicketCommentResponse.model_validate(comment)
        response.author_name = f"{author.first_name} {author.last_name}" if author else None
        responses.append(response)

    return responses


@router.put(
    "/{ticket_id}/comments/{comment_id}",
    response_model=TicketCommentResponse,
    summary="Reactie markeren als beantwoord",
    description="""
    STORY-037: Als bestuurslid wil ik reacties kunnen markeren als beantwoord.

    - Alleen bestuur kan reacties markeren als beantwoord
    - Beantwoord status wordt getoond in de tijdlijn
    """,
)
async def update_comment(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    comment_id: uuid.UUID,
    update_data: TicketCommentUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketCommentResponse:
    """Update a comment (mark as answered).

    Requires bestuurslid or beheerder role.
    """
    # Get comment
    result = await db.execute(
        select(TicketComment)
        .join(Ticket)
        .where(
            TicketComment.id == comment_id,
            TicketComment.ticket_id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    comment = result.scalar_one_or_none()

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reactie niet gevonden",
        )

    # Update answered status
    if update_data.is_answered is not None:
        comment.is_answered = update_data.is_answered
        if update_data.is_answered:
            comment.answered_by_id = current_user.id
            comment.answered_at = func.now()

            # Create timeline entry
            await _create_timeline_entry(
                db,
                ticket_id,
                current_user.id,
                "comment_answered",
                "Reactie gemarkeerd als beantwoord",
            )

    await db.commit()
    await db.refresh(comment)

    # Get author name
    author_result = await db.execute(
        select(User).where(User.id == comment.author_id)
    )
    author = author_result.scalar_one_or_none()

    response = TicketCommentResponse.model_validate(comment)
    response.author_name = f"{author.first_name} {author.last_name}" if author else None
    response.answered_by_name = current_user.full_name if comment.is_answered else None
    return response


@router.get(
    "/{ticket_id}/timeline",
    response_model=list[TicketTimelineEntryResponse],
    summary="Ticket tijdlijn ophalen",
    description="""
    STORY-029: Als bewoner wil ik de voortgang van mijn ticket volgen via een tijdlijn.

    - Tijdlijn toont alle statuswijzigingen, reacties en uploads
    - Gesorteerd op datum (nieuwste eerst)
    """,
)
async def get_timeline(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[TicketTimelineEntryResponse]:
    """Get timeline for a ticket."""
    # Get ticket and check access
    result = await db.execute(
        select(Ticket).where(
            Ticket.id == ticket_id,
            Ticket.vve_id == vve_id,
        )
    )
    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Check access
    user_role = current_user.get_role_for_vve(vve_id)
    if user_role and user_role.value == "bewoner" and ticket.submitted_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot dit ticket",
        )

    # Get timeline entries
    timeline_result = await db.execute(
        select(TicketTimelineEntry)
        .where(TicketTimelineEntry.ticket_id == ticket_id)
        .order_by(TicketTimelineEntry.created_at.desc())
    )
    entries = timeline_result.scalars().all()

    # Get actor names
    responses = []
    for entry in entries:
        actor_result = await db.execute(
            select(User).where(User.id == entry.actor_id)
        )
        actor = actor_result.scalar_one_or_none()

        response = TicketTimelineEntryResponse.model_validate(entry)
        response.actor_name = f"{actor.first_name} {actor.last_name}" if actor else None
        responses.append(response)

    return responses


# ============================================================================
# STORY-044: Supplier Status Endpoints
# ============================================================================


@router.put(
    "/{ticket_id}/supplier-status",
    response_model=TicketResponse,
    summary="Leveranciersstatus bijwerken",
    description="""
    STORY-044: Als bestuurslid wil ik zien welke status een leverancier heeft in de opvolging van een ticket.

    - Bestuur kan status bijwerken met datum en korte toelichting
    - Status: scheduled (ingepland), in_progress (bezig), completed (afgerond)
    - Maakt een tijdlijn-entry aan voor de statuswijziging
    """,
)
async def update_ticket_supplier_status(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    update_data: TicketSupplierStatusUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketResponse:
    """Update supplier status on a ticket.

    Requires bestuurslid or beheerder role.
    """
    # Get ticket
    result = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.attachments))
        .options(selectinload(Ticket.timeline))
        .options(selectinload(Ticket.supplier))
        .where(Ticket.id == ticket_id, Ticket.vve_id == vve_id)
    )
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # If supplier_id is provided, validate it exists
    supplier_name = None
    if update_data.supplier_id:
        supplier_result = await db.execute(
            select(Supplier).where(
                Supplier.id == update_data.supplier_id,
                Supplier.vve_id == vve_id,
            )
        )
        supplier = supplier_result.scalar_one_or_none()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leverancier niet gevonden",
            )
        ticket.supplier_id = supplier.id
        supplier_name = supplier.name
    elif update_data.supplier_id is None and ticket.supplier_id:
        # If explicitly set to None, remove supplier
        # Query the old supplier to get the name
        old_supplier_result = await db.execute(
            select(Supplier).where(Supplier.id == ticket.supplier_id)
        )
        old_supplier = old_supplier_result.scalar_one_or_none()
        old_supplier_name = old_supplier.name if old_supplier else "Onbekend"
        
        ticket.supplier_id = None
        ticket.supplier_status = None
        ticket.supplier_status_note = None
        ticket.supplier_status_updated_at = None
        ticket.supplier_status_updated_by_id = None
        
        # Create timeline entry for supplier removal
        await _create_timeline_entry(
            db,
            ticket.id,
            current_user.id,
            "supplier_removed",
            f"Leverancier ({old_supplier_name}) verwijderd van ticket",
            old_value=old_supplier_name,
            new_value=None,
        )

    # Update supplier status
    old_status = ticket.supplier_status.value if ticket.supplier_status else None
    new_status = update_data.supplier_status.value if update_data.supplier_status else None

    if update_data.supplier_status:
        ticket.supplier_status = DBSupplierStatus(update_data.supplier_status.value)
    
    if update_data.supplier_status_note is not None:
        ticket.supplier_status_note = update_data.supplier_status_note

    ticket.supplier_status_updated_at = datetime.now(timezone.utc)
    ticket.supplier_status_updated_by_id = current_user.id

    # Create timeline entry for status change
    if old_status != new_status:
        status_labels = {
            "scheduled": "Ingepland",
            "in_progress": "Bezig",
            "completed": "Afgerond",
        }
        new_label = status_labels.get(new_status, new_status) if new_status else "Verwijderd"
        old_label = status_labels.get(old_status, old_status) if old_status else None
        
        description = f"Leveranciersstatus gewijzigd naar: {new_label}"
        if supplier_name:
            description = f"Leverancier ({supplier_name}) status: {new_label}"
        if update_data.supplier_status_note:
            description += f" - {update_data.supplier_status_note}"

        await _create_timeline_entry(
            db,
            ticket.id,
            current_user.id,
            "supplier_status_changed",
            description,
            old_value=old_label,
            new_value=new_label,
        )

    await db.commit()
    await db.refresh(ticket, ["attachments", "timeline", "supplier"])

    # Get submitter name
    submitter_result = await db.execute(
        select(User).where(User.id == ticket.submitted_by_id)
    )
    submitter = submitter_result.scalar_one_or_none()

    # Get supplier status updater name
    updater_name = None
    if ticket.supplier_status_updated_by_id:
        updater_result = await db.execute(
            select(User).where(User.id == ticket.supplier_status_updated_by_id)
        )
        updater = updater_result.scalar_one_or_none()
        updater_name = f"{updater.first_name} {updater.last_name}" if updater else None

    response = TicketResponse.model_validate(ticket)
    response.submitted_by_name = f"{submitter.first_name} {submitter.last_name}" if submitter else None
    response.supplier_name = ticket.supplier.name if ticket.supplier else None
    response.supplier_status_updated_by_name = updater_name

    return response


# ============================================================================
# Supplier Management Endpoints (FEAT-017/STORY-035)
# ============================================================================

supplier_router = APIRouter(prefix="/vves/{vve_id}/suppliers", tags=["suppliers"])


@supplier_router.get(
    "",
    response_model=list[SupplierResponse],
    summary="Leveranciers ophalen",
    description="Haal alle leveranciers op voor een VVE. Alleen bestuur en beheerders.",
)
async def list_suppliers(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
    active_only: bool = Query(True, description="Alleen actieve leveranciers"),
) -> list[SupplierResponse]:
    """Get all suppliers for a VVE."""
    query = select(Supplier).where(Supplier.vve_id == vve_id)
    if active_only:
        query = query.where(Supplier.is_active.is_(True))
    query = query.order_by(Supplier.name)

    result = await db.execute(query)
    suppliers = result.scalars().all()

    return [SupplierResponse.model_validate(s) for s in suppliers]


@supplier_router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Leverancier toevoegen",
    description="Voeg een nieuwe leverancier toe aan de VVE. Alleen bestuur en beheerders.",
)
async def create_supplier(
    vve_id: uuid.UUID,
    supplier_data: SupplierCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupplierResponse:
    """Create a new supplier."""
    # Validate VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    supplier = Supplier(
        vve_id=vve_id,
        name=supplier_data.name,
        contact_person=supplier_data.contact_person,
        email=supplier_data.email,
        phone=supplier_data.phone,
        specialty=supplier_data.specialty,
        notes=supplier_data.notes,
        is_active=supplier_data.is_active,
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)

    return SupplierResponse.model_validate(supplier)


@supplier_router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Leverancier ophalen",
    description="Haal details op van een specifieke leverancier.",
)
async def get_supplier(
    vve_id: uuid.UUID,
    supplier_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupplierResponse:
    """Get a specific supplier."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.vve_id == vve_id)
    )
    supplier = result.scalar_one_or_none()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leverancier niet gevonden",
        )

    return SupplierResponse.model_validate(supplier)


@supplier_router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Leverancier bijwerken",
    description="Werk de gegevens van een leverancier bij.",
)
async def update_supplier(
    vve_id: uuid.UUID,
    supplier_id: uuid.UUID,
    supplier_data: SupplierUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupplierResponse:
    """Update a supplier."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.vve_id == vve_id)
    )
    supplier = result.scalar_one_or_none()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leverancier niet gevonden",
        )

    # Update fields
    if supplier_data.name is not None:
        supplier.name = supplier_data.name
    if supplier_data.contact_person is not None:
        supplier.contact_person = supplier_data.contact_person
    if supplier_data.email is not None:
        supplier.email = supplier_data.email
    if supplier_data.phone is not None:
        supplier.phone = supplier_data.phone
    if supplier_data.specialty is not None:
        supplier.specialty = supplier_data.specialty
    if supplier_data.notes is not None:
        supplier.notes = supplier_data.notes
    if supplier_data.is_active is not None:
        supplier.is_active = supplier_data.is_active

    await db.commit()
    await db.refresh(supplier)

    return SupplierResponse.model_validate(supplier)


# ============================================================================
# STORY-036: Supplier Follow-Up Endpoints
# ============================================================================


FOLLOW_UP_CHANNEL_LABELS = {
    "phone": "Telefoon",
    "email": "E-mail",
    "in_person": "Persoonlijk",
    "other": "Anders",
}


@router.get(
    "/{ticket_id}/follow-ups",
    response_model=list[SupplierFollowUpResponse],
    summary="Opvolgacties ophalen",
    description="STORY-036: Haal alle opvolgacties op voor een ticket.",
)
async def list_follow_ups(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SupplierFollowUpResponse]:
    """Get all follow-up actions for a ticket."""
    # Verify ticket exists
    ticket_result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id, Ticket.vve_id == vve_id)
    )
    if not ticket_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    result = await db.execute(
        select(SupplierFollowUp)
        .where(SupplierFollowUp.ticket_id == ticket_id)
        .order_by(SupplierFollowUp.contact_date.desc())
    )
    follow_ups = result.scalars().all()

    responses = []
    for follow_up in follow_ups:
        # Get supplier name
        supplier_result = await db.execute(
            select(Supplier).where(Supplier.id == follow_up.supplier_id)
        )
        supplier = supplier_result.scalar_one_or_none()

        # Get creator name
        creator_result = await db.execute(
            select(User).where(User.id == follow_up.created_by_id)
        )
        creator = creator_result.scalar_one_or_none()

        response = SupplierFollowUpResponse.model_validate(follow_up)
        response.supplier_name = supplier.name if supplier else None
        response.created_by_name = f"{creator.first_name} {creator.last_name}" if creator else None
        responses.append(response)

    return responses


@router.post(
    "/{ticket_id}/follow-ups",
    response_model=SupplierFollowUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Opvolgactie toevoegen",
    description="""
    STORY-036: Voeg een nieuwe opvolgactie toe aan het ticket.

    - Registreer contactmomenten met leveranciers
    - Kanalen: telefoon, e-mail, persoonlijk, anders
    - Wordt automatisch getoond in de ticket tijdlijn
    """,
)
async def create_follow_up(
    vve_id: uuid.UUID,
    ticket_id: uuid.UUID,
    follow_up_data: SupplierFollowUpCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SupplierFollowUpResponse:
    """Create a new follow-up action for a ticket."""
    # Verify ticket exists
    ticket_result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id, Ticket.vve_id == vve_id)
    )
    ticket = ticket_result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket niet gevonden",
        )

    # Verify supplier exists
    supplier_result = await db.execute(
        select(Supplier).where(
            Supplier.id == follow_up_data.supplier_id,
            Supplier.vve_id == vve_id,
        )
    )
    supplier = supplier_result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leverancier niet gevonden",
        )

    follow_up = SupplierFollowUp(
        ticket_id=ticket_id,
        supplier_id=follow_up_data.supplier_id,
        channel=DBSupplierFollowUpChannel(follow_up_data.channel.value),
        summary=follow_up_data.summary,
        contact_date=follow_up_data.contact_date,
        created_by_id=current_user.id,
    )
    db.add(follow_up)

    # Create timeline entry
    channel_label = FOLLOW_UP_CHANNEL_LABELS.get(follow_up_data.channel.value, follow_up_data.channel.value)
    await _create_timeline_entry(
        db,
        ticket_id,
        current_user.id,
        "supplier_follow_up_added",
        f"Opvolgactie toegevoegd ({channel_label}) met {supplier.name}: {follow_up_data.summary[:100]}",
    )

    await db.commit()
    await db.refresh(follow_up)

    response = SupplierFollowUpResponse.model_validate(follow_up)
    response.supplier_name = supplier.name
    response.created_by_name = f"{current_user.first_name} {current_user.last_name}"

    return response
