"""VVE Member management API routes.

Implements member on/offboarding functionality.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.dependencies.auth import (
    CurrentUser,
    require_beheerder,
    require_member,
)
from app.core.security import UserRole
from app.db.models.models import User, VVE, VVEMember
from app.db.session import get_db
from app.schemas.user import VVEMembershipResponse

router = APIRouter(prefix="/vves/{vve_id}/members", tags=["members"])


class MemberWithUserResponse(BaseModel):
    """VVE member response with user details."""

    id: uuid.UUID
    vve_id: uuid.UUID
    vve_name: str
    role: UserRole
    unit_id: uuid.UUID | None = None
    unit_number: str | None = None
    is_active: bool
    joined_at: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None


class MemberInviteRequest(BaseModel):
    """Request to invite a new member."""

    email: EmailStr
    role: UserRole = UserRole.BEWONER


class MemberUpdateRequest(BaseModel):
    """Request to update a member."""

    role: UserRole | None = None
    unit_id: uuid.UUID | None = None


@router.get(
    "",
    response_model=list[MemberWithUserResponse],
    summary="Lijst van leden ophalen",
)
async def get_members(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[MemberWithUserResponse]:
    """Get all members of a VVE.

    Returns a list of all active members with their user details.
    """
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    vve = vve_result.scalar_one_or_none()
    if vve is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Get all members with user data
    result = await db.execute(
        select(VVEMember)
        .options(
            joinedload(VVEMember.user),
            joinedload(VVEMember.unit),
        )
        .where(
            VVEMember.vve_id == vve_id,
            VVEMember.is_active.is_(True),
        )
    )
    members = result.unique().scalars().all()

    return [
        MemberWithUserResponse(
            id=m.id,
            vve_id=m.vve_id,
            vve_name=vve.name,
            role=m.role,
            unit_id=m.unit_id,
            unit_number=m.unit.unit_number if m.unit else None,
            is_active=m.is_active,
            joined_at=m.joined_at.isoformat(),
            email=m.user.email if m.user else None,
            first_name=m.user.first_name if m.user else None,
            last_name=m.user.last_name if m.user else None,
        )
        for m in members
    ]


@router.post(
    "/invite",
    response_model=VVEMembershipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Lid uitnodigen",
)
async def invite_member(
    vve_id: uuid.UUID,
    invite_data: MemberInviteRequest,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VVEMembershipResponse:
    """Invite a new member to the VVE.

    If the user already exists, adds them to the VVE.
    If not, creates a placeholder membership for future registration.

    Requires beheerder role.
    """
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    vve = vve_result.scalar_one_or_none()
    if vve is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Check if user exists
    user_result = await db.execute(
        select(User).where(User.email == invite_data.email)
    )
    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gebruiker met dit e-mailadres niet gevonden. Vraag de gebruiker eerst te registreren.",
        )

    # Check if already a member
    existing = await db.execute(
        select(VVEMember).where(
            VVEMember.user_id == user.id,
            VVEMember.vve_id == vve_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Gebruiker is al lid van deze VVE",
        )

    # Create membership
    membership = VVEMember(
        user_id=user.id,
        vve_id=vve_id,
        role=invite_data.role,
        is_active=True,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    return VVEMembershipResponse(
        id=membership.id,
        vve_id=membership.vve_id,
        vve_name=vve.name,
        role=membership.role,
        unit_id=membership.unit_id,
        unit_number=None,
        is_active=membership.is_active,
        joined_at=membership.joined_at,
    )


@router.patch(
    "/{member_id}",
    response_model=VVEMembershipResponse,
    summary="Lid bijwerken",
)
async def update_member(
    vve_id: uuid.UUID,
    member_id: uuid.UUID,
    update_data: MemberUpdateRequest,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VVEMembershipResponse:
    """Update a member's role or unit assignment.

    Requires beheerder role.
    """
    # Fetch membership
    result = await db.execute(
        select(VVEMember)
        .options(joinedload(VVEMember.vve), joinedload(VVEMember.unit))
        .where(
            VVEMember.id == member_id,
            VVEMember.vve_id == vve_id,
        )
    )
    membership = result.unique().scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lid niet gevonden",
        )

    # Update fields
    if update_data.role is not None:
        membership.role = update_data.role
    if update_data.unit_id is not None:
        membership.unit_id = update_data.unit_id

    await db.commit()
    await db.refresh(membership)

    return VVEMembershipResponse(
        id=membership.id,
        vve_id=membership.vve_id,
        vve_name=membership.vve.name if membership.vve else "Onbekend",
        role=membership.role,
        unit_id=membership.unit_id,
        unit_number=membership.unit.unit_number if membership.unit else None,
        is_active=membership.is_active,
        joined_at=membership.joined_at,
    )


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Lid verwijderen",
)
async def remove_member(
    vve_id: uuid.UUID,
    member_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Remove a member from the VVE (offboarding).

    Sets the membership to inactive rather than deleting.
    Requires beheerder role.
    """
    # Fetch membership
    result = await db.execute(
        select(VVEMember).where(
            VVEMember.id == member_id,
            VVEMember.vve_id == vve_id,
        )
    )
    membership = result.scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lid niet gevonden",
        )

    # Soft delete - set to inactive
    membership.is_active = False
    await db.commit()
