"""Tests for security module - password hashing and JWT tokens."""

from datetime import timedelta

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    has_role_permission,
    UserRole,
    verify_password,
)


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_password_hash_creates_different_hash(self):
        """Test that hashing same password twice produces different hashes."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Test that correct password verification returns True."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test that incorrect password verification returns False."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False


class TestJWTTokens:
    """Tests for JWT token creation and validation."""

    def test_create_access_token(self):
        """Test creating an access token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self):
        """Test creating a refresh token."""
        data = {"sub": "user-123"}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)

    def test_decode_valid_token(self):
        """Test decoding a valid access token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_access_token(data)
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == "access"

    def test_decode_invalid_token(self):
        """Test decoding an invalid token returns None."""
        invalid_token = "invalid.token.here"
        
        payload = decode_token(invalid_token)
        
        assert payload is None

    def test_token_with_custom_expiry(self):
        """Test creating token with custom expiry."""
        data = {"sub": "user-123"}
        token = create_access_token(data, expires_delta=timedelta(hours=1))
        
        payload = decode_token(token)
        
        assert payload is not None
        assert "exp" in payload


class TestRolePermissions:
    """Tests for role-based access control."""

    def test_beheerder_has_all_permissions(self):
        """Test that beheerder role has access to everything."""
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.BEWONER]) is True
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.PENNINGMEESTER]) is True
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.BESTUURSLID]) is True

    def test_bewoner_limited_permissions(self):
        """Test that bewoner only has bewoner permissions."""
        assert has_role_permission(UserRole.BEWONER, [UserRole.BEWONER]) is True
        assert has_role_permission(UserRole.BEWONER, [UserRole.PENNINGMEESTER]) is False
        assert has_role_permission(UserRole.BEWONER, [UserRole.BEHEERDER]) is False

    def test_penningmeester_has_bewoner_permissions(self):
        """Test that penningmeester inherits bewoner permissions."""
        assert has_role_permission(UserRole.PENNINGMEESTER, [UserRole.BEWONER]) is True
        assert has_role_permission(UserRole.PENNINGMEESTER, [UserRole.PENNINGMEESTER]) is True

    def test_bestuurslid_has_bewoner_permissions(self):
        """Test that bestuurslid inherits bewoner permissions."""
        assert has_role_permission(UserRole.BESTUURSLID, [UserRole.BEWONER]) is True
        assert has_role_permission(UserRole.BESTUURSLID, [UserRole.BESTUURSLID]) is True
