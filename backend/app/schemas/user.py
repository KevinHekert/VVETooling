"""Pydantic schemas for User and Authentication.

Based on FEAT-010 (Authentication & RBAC) and STORY-005 (Rol-gebaseerd inloggen).
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    """User roles matching the database model."""

    BEWONER = "bewoner"
    PENNINGMEESTER = "penningmeester"
    BESTUURSLID = "bestuurslid"
    BEHEERDER = "beheerder"


# ============================================================================
# User Schemas
# ============================================================================


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user data."""

    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)


class UserResponse(UserBase):
    """Schema for user response (no sensitive data)."""

    id: uuid.UUID
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    last_login: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserWithMemberships(UserResponse):
    """User with their VVE memberships."""

    memberships: list["VVEMembershipResponse"] = []


# ============================================================================
# Authentication Schemas
# ============================================================================


class LoginRequest(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""

    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Schema for password change."""

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordResetRequest(BaseModel):
    """Schema for requesting password reset."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


# ============================================================================
# VVE Membership Schemas
# ============================================================================


class VVEMembershipResponse(BaseModel):
    """Schema for VVE membership response."""

    id: uuid.UUID
    vve_id: uuid.UUID
    vve_name: str
    role: UserRole
    unit_id: uuid.UUID | None = None
    unit_number: str | None = None
    is_active: bool
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VVEMemberCreate(BaseModel):
    """Schema for adding a user to a VVE."""

    user_id: uuid.UUID
    role: UserRole = UserRole.BEWONER
    unit_id: uuid.UUID | None = None


class VVEMemberUpdate(BaseModel):
    """Schema for updating VVE membership."""

    role: UserRole | None = None
    unit_id: uuid.UUID | None = None
    is_active: bool | None = None


# Forward reference update
UserWithMemberships.model_rebuild()
