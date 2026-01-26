"""Security utilities for authentication and authorization.

Implements FEAT-010 (Authentication & RBAC) based on ADR-001.
Supports role-based access control as defined in the architecture.
"""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRole(str, Enum):
    """User roles for RBAC (FEAT-010).

    Based on architecture constraints and UX flows:
    - Bewoner (Resident): Limited access to own data
    - Penningmeester (Treasurer): Financial management
    - Bestuurslid (Board member): Documents and communication
    - Beheerder (Administrator): Full VVE management
    """

    BEWONER = "bewoner"
    PENNINGMEESTER = "penningmeester"
    BESTUURSLID = "bestuurslid"
    BEHEERDER = "beheerder"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT access token.

    Args:
        data: Claims to include in the token (must include 'sub' for user ID)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def create_refresh_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT refresh token.

    Args:
        data: Claims to include in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT refresh token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT token.

    Args:
        token: The JWT token to decode

    Returns:
        Token payload if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


def has_role_permission(user_role: UserRole, required_roles: list[UserRole]) -> bool:
    """Check if a user role has permission based on required roles.

    Role hierarchy (implicit permissions):
    - Beheerder has all permissions
    - Bestuurslid has bestuurslid + bewoner permissions
    - Penningmeester has penningmeester + bewoner permissions
    - Bewoner has only bewoner permissions

    Args:
        user_role: The user's assigned role
        required_roles: List of roles that have permission

    Returns:
        True if user has permission, False otherwise
    """
    # Beheerder has all permissions
    if user_role == UserRole.BEHEERDER:
        return True

    # Check if user's role is in required roles
    if user_role in required_roles:
        return True

    # Bestuurslid and Penningmeester implicitly have Bewoner permissions
    if UserRole.BEWONER in required_roles and user_role in [
        UserRole.BESTUURSLID,
        UserRole.PENNINGMEESTER,
    ]:
        return True

    return False
