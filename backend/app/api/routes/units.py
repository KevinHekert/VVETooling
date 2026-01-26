"""Unit (Splitsing) API routes.

Implements FEAT-003 (Splitsingssleutel configuratie) and STORY-002.
"""

import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_beheerder,
    require_member,
)
from app.db.models.models import Unit, VVE
from app.db.session import get_db
from app.schemas.unit import (
    UnitCreate,
    UnitResponse,
    UnitUpdate,
    SplitsingssleutelEntry,
    SplitsingssleutelValidation,
    SplitsingssleutelBulkUpdate,
)

router = APIRouter(prefix="/vves/{vve_id}/units", tags=["units"])


@router.post(
    "",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Eenheid toevoegen",
)
async def create_unit(
    vve_id: uuid.UUID,
    unit_data: UnitCreate,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UnitResponse:
    """Create a new unit in the VVE.

    Requires beheerder role.
    """
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )

    # Check for duplicate unit number
    existing = await db.execute(
        select(Unit).where(
            Unit.vve_id == vve_id,
            Unit.unit_number == unit_data.unit_number,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Eenheid nummer '{unit_data.unit_number}' bestaat al",
        )

    unit = Unit(
        vve_id=vve_id,
        unit_number=unit_data.unit_number,
        description=unit_data.description,
        floor=unit_data.floor,
        area_sqm=unit_data.area_sqm,
        share_percentage=unit_data.share_percentage,
    )
    db.add(unit)
    await db.commit()
    await db.refresh(unit)

    return UnitResponse.model_validate(unit)


@router.get(
    "",
    response_model=list[UnitResponse],
    summary="Eenheden ophalen",
)
async def list_units(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> list[UnitResponse]:
    """Get all units in a VVE.

    All members can view units.
    """
    result = await db.execute(
        select(Unit)
        .where(Unit.vve_id == vve_id, Unit.is_active.is_(True))
        .order_by(Unit.unit_number)
        .offset(skip)
        .limit(limit)
    )
    units = result.scalars().all()

    return [UnitResponse.model_validate(u) for u in units]


@router.get(
    "/splitsingssleutel",
    response_model=SplitsingssleutelValidation,
    summary="Splitsingssleutel valideren",
    description="""
    STORY-002: Als penningmeester wil ik dat de splitsingssleutel
    automatisch valideert op 100%, zodat ik zeker weet dat de berekening klopt.

    Returns current splitsingssleutel configuration with validation status.
    - Toont inline waarschuwing als totaal ≠ 100%
    - Geeft heldere uitleg van fout en gewenste waarde
    """,
)
async def get_splitsingssleutel(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingssleutelValidation:
    """Get and validate the current splitsingssleutel configuration.

    Automatically validates that shares sum to exactly 100%.
    """
    result = await db.execute(
        select(Unit)
        .where(Unit.vve_id == vve_id, Unit.is_active.is_(True))
        .order_by(Unit.unit_number)
    )
    units = result.scalars().all()

    entries = [
        SplitsingssleutelEntry(
            unit_id=u.id,
            unit_number=u.unit_number,
            share_percentage=u.share_percentage,
        )
        for u in units
    ]

    # Validation happens in the Pydantic model
    return SplitsingssleutelValidation(units=entries)


@router.put(
    "/splitsingssleutel",
    response_model=SplitsingssleutelValidation,
    summary="Splitsingssleutel bijwerken",
    description="""
    STORY-002: Bulk update splitsingssleutel voor alle eenheden.

    - Opslaan is pas mogelijk bij 100% totaal
    - Validatie gebeurt inline
    """,
)
async def update_splitsingssleutel(
    vve_id: uuid.UUID,
    update_data: SplitsingssleutelBulkUpdate,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SplitsingssleutelValidation:
    """Update splitsingssleutel for all units.

    The request will be rejected if total doesn't equal 100%.
    This validation happens at the schema level.
    """
    # Verify all units exist and belong to this VVE
    for entry in update_data.updates:
        result = await db.execute(
            select(Unit).where(
                Unit.id == entry.unit_id,
                Unit.vve_id == vve_id,
            )
        )
        unit = result.scalar_one_or_none()
        if unit is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eenheid '{entry.unit_number}' niet gevonden in deze VVE",
            )

        # Update the share percentage
        unit.share_percentage = entry.share_percentage

    await db.commit()

    # Return updated validation
    return await get_splitsingssleutel(vve_id, current_user, db)


@router.get(
    "/{unit_id}",
    response_model=UnitResponse,
    summary="Eenheid details ophalen",
)
async def get_unit(
    vve_id: uuid.UUID,
    unit_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UnitResponse:
    """Get a specific unit by ID."""
    result = await db.execute(
        select(Unit).where(
            Unit.id == unit_id,
            Unit.vve_id == vve_id,
        )
    )
    unit = result.scalar_one_or_none()

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eenheid niet gevonden",
        )

    return UnitResponse.model_validate(unit)


@router.put(
    "/{unit_id}",
    response_model=UnitResponse,
    summary="Eenheid wijzigen",
)
async def update_unit(
    vve_id: uuid.UUID,
    unit_id: uuid.UUID,
    update_data: UnitUpdate,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UnitResponse:
    """Update unit information.

    Note: For share_percentage updates, use the bulk splitsingssleutel
    endpoint to ensure validation of total = 100%.
    """
    result = await db.execute(
        select(Unit).where(
            Unit.id == unit_id,
            Unit.vve_id == vve_id,
        )
    )
    unit = result.scalar_one_or_none()

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eenheid niet gevonden",
        )

    # If updating share_percentage, validate the new total
    if update_data.share_percentage is not None:
        # Get current total excluding this unit
        result = await db.execute(
            select(func.sum(Unit.share_percentage))
            .where(
                Unit.vve_id == vve_id,
                Unit.is_active.is_(True),
                Unit.id != unit_id,
            )
        )
        other_total = result.scalar() or Decimal("0")
        new_total = other_total + update_data.share_percentage

        if new_total > Decimal("100.00000"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Totaal splitsingspercentage zou {new_total}% worden (max 100%)",
            )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(unit, field, value)

    await db.commit()
    await db.refresh(unit)

    return UnitResponse.model_validate(unit)


@router.delete(
    "/{unit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eenheid verwijderen",
)
async def delete_unit(
    vve_id: uuid.UUID,
    unit_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Soft delete a unit (marks as inactive).

    The splitsingssleutel will need to be reconfigured after deletion.
    """
    result = await db.execute(
        select(Unit).where(
            Unit.id == unit_id,
            Unit.vve_id == vve_id,
        )
    )
    unit = result.scalar_one_or_none()

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eenheid niet gevonden",
        )

    unit.is_active = False
    await db.commit()
