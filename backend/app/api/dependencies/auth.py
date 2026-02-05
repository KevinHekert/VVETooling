"""Authentication dependencies for FastAPI routes.

Implements FEAT-010 (Authentication & RBAC) and STORY-005 (Rol-gebaseerd inloggen).
"""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.security import UserRole, decode_token, has_role_permission
from app.db.models.models import User, VVEMember
from app.db.session import get_db

# Security scheme for JWT Bearer tokens
security = HTTPBearer()


class CurrentUser:
    """Container for authenticated user data."""

    def __init__(
        self,
        user: User,
        vve_memberships: list[VVEMember],
        current_vve_id: uuid.UUID | None = None,
    ):
        self.user = user
        self.memberships = vve_memberships
        self.current_vve_id = current_vve_id

    @property
    def id(self) -> uuid.UUID:
        """User ID."""
        return self.user.id

    @property
    def email(self) -> str:
        """User email."""
        return self.user.email

    @property
    def full_name(self) -> str:
        """User full name."""
        return f"{self.user.first_name} {self.user.last_name}"

    def get_role_for_vve(self, vve_id: uuid.UUID) -> UserRole | None:
        """Get user's role for a specific VVE."""
        for membership in self.memberships:
            if membership.vve_id == vve_id and membership.is_active:
                return UserRole(membership.role.value)
        return None

    def has_vve_access(self, vve_id: uuid.UUID) -> bool:
        """Check if user has access to a VVE."""
        return any(
            m.vve_id == vve_id and m.is_active for m in self.memberships
        )

    def has_role_in_vve(
        self, vve_id: uuid.UUID, required_roles: list[UserRole]
    ) -> bool:
        """Check if user has one of the required roles in a VVE."""
        role = self.get_role_for_vve(vve_id)
        if role is None:
            return False
        return has_role_permission(role, required_roles)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CurrentUser:
    """Dependency to get the current authenticated user.

    Decodes and validates the JWT token, then fetches the user
    with their VVE memberships.

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Ongeldige authenticatie gegevens",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    # Validate token type
    if payload.get("type") != "access":
        raise credentials_exception

    # Get user ID from token
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Fetch user with memberships
    result = await db.execute(
        select(User)
        .options(
            joinedload(User.memberships).joinedload(VVEMember.vve),
            joinedload(User.memberships).joinedload(VVEMember.unit),
        )
        .where(User.id == user_id, User.is_active.is_(True))
    )
    user = result.unique().scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return CurrentUser(
        user=user,
        vve_memberships=list(user.memberships),
    )


async def get_current_active_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CurrentUser:
    """Dependency to ensure user is active."""
    if not current_user.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is niet actief",
        )
    return current_user


class RoleChecker:
    """Dependency class for role-based access control.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))]
        ):
            ...
    """

    def __init__(self, required_roles: list[UserRole]):
        self.required_roles = required_roles

    async def __call__(
        self,
        current_user: Annotated[CurrentUser, Depends(get_current_active_user)],
        vve_id: uuid.UUID | None = None,
    ) -> CurrentUser:
        """Check if user has required role."""
        if vve_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="VVE ID is vereist",
            )

        if not current_user.has_vve_access(vve_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Geen toegang tot deze VVE",
            )

        if not current_user.has_role_in_vve(vve_id, self.required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Onvoldoende rechten voor deze actie",
            )

        current_user.current_vve_id = vve_id
        return current_user


# Common role dependencies
require_beheerder = RoleChecker([UserRole.BEHEERDER])
require_penningmeester = RoleChecker([UserRole.PENNINGMEESTER, UserRole.BEHEERDER])
require_bestuurslid = RoleChecker([UserRole.BESTUURSLID, UserRole.BEHEERDER])
require_member = RoleChecker([
    UserRole.BEWONER,
    UserRole.PENNINGMEESTER,
    UserRole.BESTUURSLID,
    UserRole.BEHEERDER,
])
