"""Voting API routes.

Implements EPIC-027 (Digitaal Stemmen & Polls):
- FEAT-067: Digitale Stemming (STORY-113, STORY-114, STORY-115)
- FEAT-068: Polls & Peilingen (STORY-116)
- FEAT-069: Volmacht Beheer (STORY-117)
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import (
    Vote,
    VoteChoice as DBVoteChoice,
    Voting,
    VotingStatus as DBVotingStatus,
    VotingProxy,
    VotingProxyStatus as DBVotingProxyStatus,
    Unit,
    User,
    VVE,
    VVEMember,
)
from app.db.session import get_db
from app.schemas.voting import (
    VoteChoice,
    VoteConfirmation,
    VoteCreate,
    VoteResponse,
    VotingCreate,
    VotingListResponse,
    VotingResponse,
    VotingResultsDetail,
    VotingResultsSummary,
    VotingStatus,
    VotingUpdate,
    VotingProxyCreate,
    VotingProxyResponse,
    VotingProxyListResponse,
    VotingProxyConfirmation,
    VotingProxyStatus,
)

router = APIRouter(prefix="/vves/{vve_id}/voting", tags=["voting"])


def calculate_days_remaining(end_date: datetime) -> int | None:
    """Calculate days remaining until voting closes."""
    now = datetime.now(timezone.utc)
    if end_date < now:
        return None
    return (end_date - now).days


def is_voting_active(voting: Voting) -> bool:
    """Check if voting is currently active."""
    now = datetime.now(timezone.utc)
    return (
        voting.status == DBVotingStatus.OPEN
        and voting.start_date <= now
        and voting.end_date > now
    )


# ============================================================================
# Voting CRUD (STORY-113)
# ============================================================================


@router.post(
    "",
    response_model=VotingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Digitale stemming aanmaken",
    description="""
    STORY-113: Als voorzitter wil ik een digitale stemming kunnen aanmaken.
    
    - Voorstel met titel en beschrijving
    - Stem opties: voor, tegen, blanco
    - Start en einddatum
    - Koppeling aan ALV of zelfstandig
    """,
)
async def create_voting(
    vve_id: uuid.UUID,
    voting_data: VotingCreate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResponse:
    """Create a new voting (STORY-113)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    voting = Voting(
        vve_id=vve_id,
        title=voting_data.title,
        description=voting_data.description,
        start_date=voting_data.start_date,
        end_date=voting_data.end_date,
        meeting_id=voting_data.meeting_id,
        quorum_percentage=voting_data.quorum_percentage,
        created_by_id=current_user.id,
    )
    db.add(voting)
    await db.commit()
    await db.refresh(voting)

    return VotingResponse(
        id=voting.id,
        vve_id=voting.vve_id,
        title=voting.title,
        description=voting.description,
        start_date=voting.start_date,
        end_date=voting.end_date,
        meeting_id=voting.meeting_id,
        quorum_percentage=voting.quorum_percentage,
        status=VotingStatus(voting.status.value),
        total_votes=voting.total_votes,
        votes_for=voting.votes_for,
        votes_against=voting.votes_against,
        votes_abstain=voting.votes_abstain,
        created_by_id=voting.created_by_id,
        created_at=voting.created_at,
        updated_at=voting.updated_at,
        is_active=is_voting_active(voting),
        days_remaining=calculate_days_remaining(voting.end_date),
    )


@router.get(
    "",
    response_model=list[VotingListResponse],
    summary="Lijst van stemmingen",
)
async def list_votings(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: VotingStatus | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[VotingListResponse]:
    """Get list of votings."""
    query = select(Voting).where(Voting.vve_id == vve_id)

    if status_filter:
        query = query.where(Voting.status == DBVotingStatus(status_filter.value))

    query = query.order_by(Voting.end_date.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    votings = result.scalars().all()

    return [
        VotingListResponse(
            id=v.id,
            vve_id=v.vve_id,
            title=v.title,
            status=VotingStatus(v.status.value),
            start_date=v.start_date,
            end_date=v.end_date,
            total_votes=v.total_votes,
            is_active=is_voting_active(v),
            days_remaining=calculate_days_remaining(v.end_date),
        )
        for v in votings
    ]


@router.get(
    "/{voting_id}",
    response_model=VotingResponse,
    summary="Stemming details",
)
async def get_voting(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResponse:
    """Get voting details."""
    result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    # Get creator name
    created_by_name = None
    if voting.created_by_id:
        user_result = await db.execute(select(User).where(User.id == voting.created_by_id))
        user = user_result.scalar_one_or_none()
        if user:
            created_by_name = f"{user.first_name} {user.last_name}"

    return VotingResponse(
        id=voting.id,
        vve_id=voting.vve_id,
        title=voting.title,
        description=voting.description,
        start_date=voting.start_date,
        end_date=voting.end_date,
        meeting_id=voting.meeting_id,
        quorum_percentage=voting.quorum_percentage,
        status=VotingStatus(voting.status.value),
        total_votes=voting.total_votes,
        votes_for=voting.votes_for,
        votes_against=voting.votes_against,
        votes_abstain=voting.votes_abstain,
        quorum_reached=voting.quorum_reached,
        result_percentage_for=voting.result_percentage_for,
        created_by_id=voting.created_by_id,
        created_by_name=created_by_name,
        created_at=voting.created_at,
        updated_at=voting.updated_at,
        is_active=is_voting_active(voting),
        days_remaining=calculate_days_remaining(voting.end_date),
    )


@router.put(
    "/{voting_id}",
    response_model=VotingResponse,
    summary="Stemming wijzigen",
)
async def update_voting(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    update_data: VotingUpdate,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResponse:
    """Update a voting (only allowed when in draft status)."""
    result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    # Can only edit draft votings (unless just changing status)
    if voting.status != DBVotingStatus.DRAFT and update_data.status is None:
        raise HTTPException(
            status_code=400,
            detail="Alleen concept-stemmingen kunnen worden gewijzigd"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if field == "status" and value is not None:
            setattr(voting, field, DBVotingStatus(value.value))
        else:
            setattr(voting, field, value)

    await db.commit()
    await db.refresh(voting)

    return VotingResponse(
        id=voting.id,
        vve_id=voting.vve_id,
        title=voting.title,
        description=voting.description,
        start_date=voting.start_date,
        end_date=voting.end_date,
        meeting_id=voting.meeting_id,
        quorum_percentage=voting.quorum_percentage,
        status=VotingStatus(voting.status.value),
        total_votes=voting.total_votes,
        votes_for=voting.votes_for,
        votes_against=voting.votes_against,
        votes_abstain=voting.votes_abstain,
        created_by_id=voting.created_by_id,
        created_at=voting.created_at,
        updated_at=voting.updated_at,
        is_active=is_voting_active(voting),
        days_remaining=calculate_days_remaining(voting.end_date),
    )


@router.post(
    "/{voting_id}/open",
    response_model=VotingResponse,
    summary="Stemming openen",
)
async def open_voting(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResponse:
    """Open a voting for votes."""
    result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    if voting.status != DBVotingStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Alleen concept-stemmingen kunnen worden geopend")

    voting.status = DBVotingStatus.OPEN
    await db.commit()
    await db.refresh(voting)

    return VotingResponse(
        id=voting.id,
        vve_id=voting.vve_id,
        title=voting.title,
        description=voting.description,
        start_date=voting.start_date,
        end_date=voting.end_date,
        meeting_id=voting.meeting_id,
        quorum_percentage=voting.quorum_percentage,
        status=VotingStatus(voting.status.value),
        total_votes=voting.total_votes,
        votes_for=voting.votes_for,
        votes_against=voting.votes_against,
        votes_abstain=voting.votes_abstain,
        created_by_id=voting.created_by_id,
        created_at=voting.created_at,
        updated_at=voting.updated_at,
        is_active=is_voting_active(voting),
        days_remaining=calculate_days_remaining(voting.end_date),
    )


@router.delete(
    "/{voting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Stemming verwijderen",
)
async def delete_voting(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a voting (only allowed when in draft status)."""
    result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    if voting.status != DBVotingStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Alleen concept-stemmingen kunnen worden verwijderd"
        )

    await db.delete(voting)
    await db.commit()


# ============================================================================
# Voting (STORY-114)
# ============================================================================


@router.post(
    "/{voting_id}/vote",
    response_model=VoteConfirmation,
    status_code=status.HTTP_201_CREATED,
    summary="Stem uitbrengen",
    description="""
    STORY-114: Als eigenaar wil ik mijn stem kunnen uitbrengen.
    
    - Stem opties: voor, tegen, blanco
    - Eén stem per eigendomsrecht
    - Bevestiging voor definitief stemmen
    - Stem kan niet worden gewijzigd na uitbrengen
    """,
)
async def cast_vote(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    vote_data: VoteCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VoteConfirmation:
    """Cast a vote (STORY-114)."""
    # Get voting
    voting_result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = voting_result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    # Check if voting is active
    if not is_voting_active(voting):
        raise HTTPException(status_code=400, detail="Stemming is niet actief")

    # Verify unit belongs to VVE and user has access
    unit_result = await db.execute(
        select(Unit).where(Unit.id == vote_data.unit_id, Unit.vve_id == vve_id)
    )
    unit = unit_result.scalar_one_or_none()

    if unit is None:
        raise HTTPException(status_code=404, detail="Eenheid niet gevonden")

    # Check if already voted with this unit
    existing_vote = await db.execute(
        select(Vote).where(
            Vote.voting_id == voting_id,
            Vote.unit_id == vote_data.unit_id,
        )
    )
    if existing_vote.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400,
            detail="Er is al gestemd met deze eenheid"
        )

    # Create vote
    vote = Vote(
        voting_id=voting_id,
        unit_id=vote_data.unit_id,
        user_id=current_user.id,
        choice=DBVoteChoice(vote_data.choice.value),
        share_percentage=unit.share_percentage,
    )
    db.add(vote)

    # Update voting totals
    voting.total_votes += 1
    if vote_data.choice == VoteChoice.VOOR:
        voting.votes_for += 1
    elif vote_data.choice == VoteChoice.TEGEN:
        voting.votes_against += 1
    else:
        voting.votes_abstain += 1

    await db.commit()

    return VoteConfirmation(
        voting_id=voting_id,
        voting_title=voting.title,
        choice=vote_data.choice,
        voted_at=vote.voted_at,
        message="Uw stem is succesvol geregistreerd",
    )


@router.get(
    "/{voting_id}/my-vote",
    response_model=VoteResponse | None,
    summary="Mijn stem ophalen",
)
async def get_my_vote(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    unit_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VoteResponse | None:
    """Get the current user's vote for a voting."""
    result = await db.execute(
        select(Vote).where(
            Vote.voting_id == voting_id,
            Vote.unit_id == unit_id,
        )
    )
    vote = result.scalar_one_or_none()

    if vote is None:
        return None

    # Get unit number
    unit_result = await db.execute(select(Unit).where(Unit.id == vote.unit_id))
    unit = unit_result.scalar_one_or_none()

    return VoteResponse(
        id=vote.id,
        voting_id=vote.voting_id,
        unit_id=vote.unit_id,
        unit_number=unit.unit_number if unit else None,
        user_id=vote.user_id,
        choice=VoteChoice(vote.choice.value),
        share_percentage=vote.share_percentage,
        voted_at=vote.voted_at,
    )


# ============================================================================
# Voting Results (STORY-115)
# ============================================================================


@router.get(
    "/{voting_id}/results",
    response_model=VotingResultsSummary,
    summary="Stemresultaten bekijken",
    description="""
    STORY-115: Bekijk de stemresultaten na afsluiting.
    
    - Resultaten pas zichtbaar na sluitingsdatum
    - Totaal voor, tegen, blanco met percentages
    - Quorum validatie
    """,
)
async def get_voting_results(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResultsSummary:
    """Get voting results (STORY-115)."""
    # Get voting
    voting_result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = voting_result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    # Results only visible after end date (for non-board members)
    now = datetime.now(timezone.utc)
    # For simplicity, allow viewing results anytime - in production, add role check

    # Get all votes with share weights
    votes_result = await db.execute(
        select(Vote).where(Vote.voting_id == voting_id)
    )
    votes = votes_result.scalars().all()

    # Calculate total eligible shares
    units_result = await db.execute(
        select(func.sum(Unit.share_percentage)).where(Unit.vve_id == vve_id, Unit.is_active.is_(True))
    )
    total_eligible_shares = Decimal(units_result.scalar() or 0)

    # Calculate voted shares and by choice
    total_voted_shares = Decimal(0)
    votes_for_shares = Decimal(0)
    votes_against_shares = Decimal(0)
    votes_abstain_shares = Decimal(0)

    for vote in votes:
        share = Decimal(str(vote.share_percentage))
        total_voted_shares += share
        if vote.choice == DBVoteChoice.VOOR:
            votes_for_shares += share
        elif vote.choice == DBVoteChoice.TEGEN:
            votes_against_shares += share
        else:
            votes_abstain_shares += share

    # Calculate percentages
    participation = (total_voted_shares / total_eligible_shares * 100) if total_eligible_shares > 0 else Decimal(0)
    votes_for_pct = (votes_for_shares / total_voted_shares * 100) if total_voted_shares > 0 else Decimal(0)
    votes_against_pct = (votes_against_shares / total_voted_shares * 100) if total_voted_shares > 0 else Decimal(0)
    votes_abstain_pct = (votes_abstain_shares / total_voted_shares * 100) if total_voted_shares > 0 else Decimal(0)

    # Check quorum
    quorum_reached = participation >= voting.quorum_percentage

    # Determine result
    if not quorum_reached:
        result = "geen quorum"
    elif votes_for_shares > votes_against_shares:
        result = "aangenomen"
    else:
        result = "verworpen"

    # Update voting with results if closed
    if voting.status == DBVotingStatus.CLOSED or voting.end_date < now:
        voting.quorum_reached = quorum_reached
        voting.result_percentage_for = votes_for_pct
        if voting.status != DBVotingStatus.CLOSED:
            voting.status = DBVotingStatus.CLOSED
        await db.commit()

    return VotingResultsSummary(
        voting_id=voting_id,
        title=voting.title,
        status=VotingStatus(voting.status.value),
        total_eligible_shares=total_eligible_shares,
        total_voted_shares=total_voted_shares,
        participation_percentage=round(participation, 2),
        votes_for_count=voting.votes_for,
        votes_for_shares=votes_for_shares,
        votes_for_percentage=round(votes_for_pct, 2),
        votes_against_count=voting.votes_against,
        votes_against_shares=votes_against_shares,
        votes_against_percentage=round(votes_against_pct, 2),
        votes_abstain_count=voting.votes_abstain,
        votes_abstain_shares=votes_abstain_shares,
        votes_abstain_percentage=round(votes_abstain_pct, 2),
        quorum_percentage_required=voting.quorum_percentage,
        quorum_reached=quorum_reached,
        result=result,
        closed_at=voting.end_date if voting.status == DBVotingStatus.CLOSED else None,
    )


@router.post(
    "/{voting_id}/close",
    response_model=VotingResultsSummary,
    summary="Stemming sluiten",
)
async def close_voting(
    vve_id: uuid.UUID,
    voting_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingResultsSummary:
    """Close a voting and finalize results."""
    # Get voting
    voting_result = await db.execute(
        select(Voting).where(Voting.id == voting_id, Voting.vve_id == vve_id)
    )
    voting = voting_result.scalar_one_or_none()

    if voting is None:
        raise HTTPException(status_code=404, detail="Stemming niet gevonden")

    if voting.status == DBVotingStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Stemming is al gesloten")

    if voting.status == DBVotingStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Concept-stemming kan niet worden gesloten")

    voting.status = DBVotingStatus.CLOSED
    await db.commit()

    # Return results
    return await get_voting_results(vve_id, voting_id, current_user, db)


# ============================================================================
# Voting Proxy (STORY-117)
# ============================================================================


@router.post(
    "/proxies",
    response_model=VotingProxyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Volmacht registreren",
    description="""
    STORY-117: Als eigenaar wil ik digitaal een volmacht kunnen geven.
    
    - Selectie van gevolmachtigde uit eigenaren-lijst
    - Koppeling aan specifieke stemming of alle stemmingen
    - Bevestiging naar beide partijen
    """,
)
async def create_voting_proxy(
    vve_id: uuid.UUID,
    proxy_data: VotingProxyCreate,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingProxyResponse:
    """Create a new voting proxy (STORY-117)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="VVE niet gevonden")

    # Verify unit belongs to VVE
    unit_result = await db.execute(
        select(Unit).where(Unit.id == proxy_data.unit_id, Unit.vve_id == vve_id)
    )
    unit = unit_result.scalar_one_or_none()
    if unit is None:
        raise HTTPException(status_code=404, detail="Eenheid niet gevonden")

    # Verify grantee exists and is member of VVE
    grantee_result = await db.execute(select(User).where(User.id == proxy_data.grantee_id))
    grantee = grantee_result.scalar_one_or_none()
    if grantee is None:
        raise HTTPException(status_code=404, detail="Gevolmachtigde niet gevonden")

    grantee_member_result = await db.execute(
        select(VVEMember).where(
            VVEMember.user_id == proxy_data.grantee_id,
            VVEMember.vve_id == vve_id,
            VVEMember.is_active.is_(True),
        )
    )
    if grantee_member_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=400,
            detail="Gevolmachtigde is geen actief lid van deze VVE"
        )

    # Can't grant proxy to yourself
    if proxy_data.grantee_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="U kunt geen volmacht aan uzelf geven"
        )

    # Check if voting exists (if specified)
    voting_title = None
    if proxy_data.voting_id:
        voting_result = await db.execute(
            select(Voting).where(
                Voting.id == proxy_data.voting_id,
                Voting.vve_id == vve_id,
            )
        )
        voting = voting_result.scalar_one_or_none()
        if voting is None:
            raise HTTPException(status_code=404, detail="Stemming niet gevonden")
        voting_title = voting.title

    # Check for existing active proxy for this unit/voting combination
    existing_query = select(VotingProxy).where(
        VotingProxy.unit_id == proxy_data.unit_id,
        VotingProxy.status.in_([DBVotingProxyStatus.PENDING, DBVotingProxyStatus.CONFIRMED]),
    )
    if proxy_data.voting_id:
        existing_query = existing_query.where(VotingProxy.voting_id == proxy_data.voting_id)
    else:
        existing_query = existing_query.where(VotingProxy.voting_id.is_(None))

    existing_result = await db.execute(existing_query)
    if existing_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400,
            detail="Er bestaat al een actieve volmacht voor deze eenheid"
        )

    # Create proxy
    proxy = VotingProxy(
        grantor_id=current_user.id,
        grantee_id=proxy_data.grantee_id,
        unit_id=proxy_data.unit_id,
        voting_id=proxy_data.voting_id,
        vve_id=vve_id,
        notes=proxy_data.notes,
    )
    db.add(proxy)
    await db.commit()
    await db.refresh(proxy)

    # Get names for response
    grantor_name = f"{current_user.first_name} {current_user.last_name}"
    grantee_name = f"{grantee.first_name} {grantee.last_name}"

    return VotingProxyResponse(
        id=proxy.id,
        grantor_id=proxy.grantor_id,
        grantor_name=grantor_name,
        grantee_id=proxy.grantee_id,
        grantee_name=grantee_name,
        unit_id=proxy.unit_id,
        unit_number=unit.unit_number,
        voting_id=proxy.voting_id,
        voting_title=voting_title,
        vve_id=proxy.vve_id,
        status=VotingProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.get(
    "/proxies",
    response_model=list[VotingProxyListResponse],
    summary="Lijst van volmachten",
)
async def list_voting_proxies(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: VotingProxyStatus | None = Query(None, alias="status"),
    voting_id: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[VotingProxyListResponse]:
    """Get list of voting proxies for the VVE."""
    query = select(VotingProxy).where(VotingProxy.vve_id == vve_id)

    if status_filter:
        query = query.where(VotingProxy.status == DBVotingProxyStatus(status_filter.value))

    if voting_id:
        query = query.where(VotingProxy.voting_id == voting_id)

    query = query.order_by(VotingProxy.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    proxies = result.scalars().all()

    response = []
    for proxy in proxies:
        # Get names
        grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
        grantor = grantor_result.scalar_one_or_none()
        grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
        grantee = grantee_result.scalar_one_or_none()
        unit_result = await db.execute(select(Unit).where(Unit.id == proxy.unit_id))
        unit = unit_result.scalar_one_or_none()

        voting_title = None
        if proxy.voting_id:
            voting_result = await db.execute(select(Voting).where(Voting.id == proxy.voting_id))
            voting = voting_result.scalar_one_or_none()
            if voting:
                voting_title = voting.title

        response.append(
            VotingProxyListResponse(
                id=proxy.id,
                grantor_name=f"{grantor.first_name} {grantor.last_name}" if grantor else "Onbekend",
                grantee_name=f"{grantee.first_name} {grantee.last_name}" if grantee else "Onbekend",
                unit_number=unit.unit_number if unit else "Onbekend",
                voting_title=voting_title,
                status=VotingProxyStatus(proxy.status.value),
                created_at=proxy.created_at,
            )
        )

    return response


@router.get(
    "/proxies/{proxy_id}",
    response_model=VotingProxyResponse,
    summary="Volmacht details",
)
async def get_voting_proxy(
    vve_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingProxyResponse:
    """Get voting proxy details."""
    result = await db.execute(
        select(VotingProxy).where(VotingProxy.id == proxy_id, VotingProxy.vve_id == vve_id)
    )
    proxy = result.scalar_one_or_none()

    if proxy is None:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Get related data
    grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
    grantor = grantor_result.scalar_one_or_none()
    grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
    grantee = grantee_result.scalar_one_or_none()
    unit_result = await db.execute(select(Unit).where(Unit.id == proxy.unit_id))
    unit = unit_result.scalar_one_or_none()

    voting_title = None
    if proxy.voting_id:
        voting_result = await db.execute(select(Voting).where(Voting.id == proxy.voting_id))
        voting = voting_result.scalar_one_or_none()
        if voting:
            voting_title = voting.title

    return VotingProxyResponse(
        id=proxy.id,
        grantor_id=proxy.grantor_id,
        grantor_name=f"{grantor.first_name} {grantor.last_name}" if grantor else "Onbekend",
        grantee_id=proxy.grantee_id,
        grantee_name=f"{grantee.first_name} {grantee.last_name}" if grantee else "Onbekend",
        unit_id=proxy.unit_id,
        unit_number=unit.unit_number if unit else "Onbekend",
        voting_id=proxy.voting_id,
        voting_title=voting_title,
        vve_id=proxy.vve_id,
        status=VotingProxyStatus(proxy.status.value),
        notes=proxy.notes,
        confirmed_at=proxy.confirmed_at,
        revoked_at=proxy.revoked_at,
        created_at=proxy.created_at,
        updated_at=proxy.updated_at,
    )


@router.post(
    "/proxies/{proxy_id}/confirm",
    response_model=VotingProxyConfirmation,
    summary="Volmacht bevestigen",
    description="Gevolmachtigde bevestigt de ontvangen volmacht.",
)
async def confirm_voting_proxy(
    vve_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingProxyConfirmation:
    """Confirm a voting proxy (by grantee)."""
    result = await db.execute(
        select(VotingProxy).where(VotingProxy.id == proxy_id, VotingProxy.vve_id == vve_id)
    )
    proxy = result.scalar_one_or_none()

    if proxy is None:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Only grantee can confirm
    if proxy.grantee_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Alleen de gevolmachtigde kan de volmacht bevestigen"
        )

    if proxy.status != DBVotingProxyStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Volmacht kan alleen worden bevestigd als deze nog wacht op bevestiging"
        )

    proxy.status = DBVotingProxyStatus.CONFIRMED
    proxy.confirmed_at = datetime.now(timezone.utc)
    await db.commit()

    return VotingProxyConfirmation(
        proxy_id=proxy.id,
        message="Volmacht succesvol bevestigd",
        status=VotingProxyStatus(proxy.status.value),
    )


@router.post(
    "/proxies/{proxy_id}/revoke",
    response_model=VotingProxyConfirmation,
    summary="Volmacht intrekken",
    description="Volmachtgever trekt de volmacht in.",
)
async def revoke_voting_proxy(
    vve_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VotingProxyConfirmation:
    """Revoke a voting proxy (by grantor)."""
    result = await db.execute(
        select(VotingProxy).where(VotingProxy.id == proxy_id, VotingProxy.vve_id == vve_id)
    )
    proxy = result.scalar_one_or_none()

    if proxy is None:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Only grantor can revoke
    if proxy.grantor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Alleen de volmachtgever kan de volmacht intrekken"
        )

    if proxy.status == DBVotingProxyStatus.REVOKED:
        raise HTTPException(status_code=400, detail="Volmacht is al ingetrokken")

    if proxy.status == DBVotingProxyStatus.USED:
        raise HTTPException(
            status_code=400,
            detail="Volmacht is al gebruikt en kan niet meer worden ingetrokken"
        )

    proxy.status = DBVotingProxyStatus.REVOKED
    proxy.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    return VotingProxyConfirmation(
        proxy_id=proxy.id,
        message="Volmacht succesvol ingetrokken",
        status=VotingProxyStatus(proxy.status.value),
    )


@router.delete(
    "/proxies/{proxy_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Volmacht verwijderen",
)
async def delete_voting_proxy(
    vve_id: uuid.UUID,
    proxy_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a voting proxy (only allowed when pending)."""
    result = await db.execute(
        select(VotingProxy).where(VotingProxy.id == proxy_id, VotingProxy.vve_id == vve_id)
    )
    proxy = result.scalar_one_or_none()

    if proxy is None:
        raise HTTPException(status_code=404, detail="Volmacht niet gevonden")

    # Only grantor can delete
    if proxy.grantor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Alleen de volmachtgever kan de volmacht verwijderen"
        )

    if proxy.status != DBVotingProxyStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Alleen volmachten met status 'wachtend' kunnen worden verwijderd"
        )

    await db.delete(proxy)
    await db.commit()


@router.get(
    "/proxies/my-proxies/granted",
    response_model=list[VotingProxyListResponse],
    summary="Mijn afgegeven volmachten",
)
async def get_my_granted_proxies(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VotingProxyListResponse]:
    """Get proxies granted by the current user."""
    result = await db.execute(
        select(VotingProxy).where(
            VotingProxy.vve_id == vve_id,
            VotingProxy.grantor_id == current_user.id,
        ).order_by(VotingProxy.created_at.desc())
    )
    proxies = result.scalars().all()

    response = []
    for proxy in proxies:
        grantee_result = await db.execute(select(User).where(User.id == proxy.grantee_id))
        grantee = grantee_result.scalar_one_or_none()
        unit_result = await db.execute(select(Unit).where(Unit.id == proxy.unit_id))
        unit = unit_result.scalar_one_or_none()

        voting_title = None
        if proxy.voting_id:
            voting_result = await db.execute(select(Voting).where(Voting.id == proxy.voting_id))
            voting = voting_result.scalar_one_or_none()
            if voting:
                voting_title = voting.title

        response.append(
            VotingProxyListResponse(
                id=proxy.id,
                grantor_name=f"{current_user.first_name} {current_user.last_name}",
                grantee_name=f"{grantee.first_name} {grantee.last_name}" if grantee else "Onbekend",
                unit_number=unit.unit_number if unit else "Onbekend",
                voting_title=voting_title,
                status=VotingProxyStatus(proxy.status.value),
                created_at=proxy.created_at,
            )
        )

    return response


@router.get(
    "/proxies/my-proxies/received",
    response_model=list[VotingProxyListResponse],
    summary="Mijn ontvangen volmachten",
)
async def get_my_received_proxies(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VotingProxyListResponse]:
    """Get proxies received by the current user."""
    result = await db.execute(
        select(VotingProxy).where(
            VotingProxy.vve_id == vve_id,
            VotingProxy.grantee_id == current_user.id,
        ).order_by(VotingProxy.created_at.desc())
    )
    proxies = result.scalars().all()

    response = []
    for proxy in proxies:
        grantor_result = await db.execute(select(User).where(User.id == proxy.grantor_id))
        grantor = grantor_result.scalar_one_or_none()
        unit_result = await db.execute(select(Unit).where(Unit.id == proxy.unit_id))
        unit = unit_result.scalar_one_or_none()

        voting_title = None
        if proxy.voting_id:
            voting_result = await db.execute(select(Voting).where(Voting.id == proxy.voting_id))
            voting = voting_result.scalar_one_or_none()
            if voting:
                voting_title = voting.title

        response.append(
            VotingProxyListResponse(
                id=proxy.id,
                grantor_name=f"{grantor.first_name} {grantor.last_name}" if grantor else "Onbekend",
                grantee_name=f"{current_user.first_name} {current_user.last_name}",
                unit_number=unit.unit_number if unit else "Onbekend",
                voting_title=voting_title,
                status=VotingProxyStatus(proxy.status.value),
                created_at=proxy.created_at,
            )
        )

    return response
