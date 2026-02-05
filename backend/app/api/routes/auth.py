"""Authentication API routes.

Implements FEAT-010 (Authentication & RBAC) and STORY-005 (Rol-gebaseerd inloggen).
"""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import CurrentUser, get_current_active_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.core.config import get_settings
from app.db.models.models import User
from app.db.session import get_db
from app.schemas.user import (
    LoginRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
    VVEMembershipResponse,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
settings = get_settings()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registreer een nieuwe gebruiker",
)
async def register(
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Register a new user account.

    Creates a new user with the provided credentials.
    The user will need to verify their email before full access.
    """
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email adres is al in gebruik",
        )

    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Inloggen en tokens ophalen",
)
async def login(
    credentials: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Authenticate user and return access tokens.

    Implements STORY-005: Rol-gebaseerd inloggen.
    Returns JWT tokens for subsequent API calls.
    On failure, returns inline error (no blocking dialogs as per UX guidelines).
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()

    # Verify credentials (use constant-time comparison)
    if user is None or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Onjuiste email of wachtwoord",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is niet actief",
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Create tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Vernieuw access token",
)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Refresh the access token using a valid refresh token."""
    # Decode refresh token
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ongeldige refresh token",
        )

    # Verify user still exists and is active
    user_id = payload.get("sub")
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active.is_(True))
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gebruiker niet gevonden",
        )

    # Create new tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
    }
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Huidige gebruiker ophalen",
)
async def get_me(
    current_user: Annotated[CurrentUser, Depends(get_current_active_user)],
) -> UserResponse:
    """Get the current authenticated user's profile."""
    return UserResponse.model_validate(current_user.user)


@router.get(
    "/me/memberships",
    response_model=list[VVEMembershipResponse],
    summary="VVE lidmaatschappen van huidige gebruiker ophalen",
)
async def get_my_memberships(
    current_user: Annotated[CurrentUser, Depends(get_current_active_user)],
) -> list[VVEMembershipResponse]:
    """Get the current user's VVE memberships.

    Returns a list of VVEs the user is a member of, including their role
    and unit assignment for each VVE.
    """
    return [
        VVEMembershipResponse(
            id=m.id,
            vve_id=m.vve_id,
            vve_name=m.vve.name if m.vve else "Onbekend",
            role=m.role,
            unit_id=m.unit_id,
            unit_number=m.unit.unit_number if m.unit else None,
            is_active=m.is_active,
            joined_at=m.joined_at,
        )
        for m in current_user.memberships
        if m.is_active
    ]


@router.post(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Wachtwoord wijzigen",
)
async def change_password(
    request: PasswordChangeRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Change the current user's password."""
    # Verify current password
    if not verify_password(
        request.current_password, current_user.user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Huidig wachtwoord is onjuist",
        )

    # Update password
    current_user.user.hashed_password = get_password_hash(request.new_password)
    await db.commit()
