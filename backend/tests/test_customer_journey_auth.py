"""Tests for Customer Journey: Authentication & Registration.

Based on customer journeys:
- 1.1 Penningmeester Ontdekt VVE Tooling (Trial starten)
- 2.1 Penningmeester Richt VVE In (Account aanmaken)
- 2.2 Voorzitter Wordt Uitgenodigd (Account aanmaken)
- 2.3 Bewoner Activeert Account

These tests validate the authentication flows from user perspective.
"""

import pytest
from datetime import timedelta

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
    has_role_permission,
    UserRole,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    PasswordChangeRequest,
    UserRole as SchemaUserRole,
    VVEMemberCreate,
    VVEMemberUpdate,
    VVEMembershipResponse,
    UserUpdate,
    UserWithMemberships,
)


class TestUserRegistrationJourney:
    """Tests for Customer Journey: User Registration (2.1, 2.2, 2.3).
    
    STORY-005: Rol-gebaseerd inloggen
    """

    def test_user_create_schema_valid(self):
        """Test creating a valid user account."""
        user = UserCreate(
            email="jan.jansen@example.com",
            first_name="Jan",
            last_name="Jansen",
            password="VeiligWachtwoord123",
            phone="+31612345678",
        )
        
        assert user.email == "jan.jansen@example.com"
        assert user.first_name == "Jan"
        assert user.last_name == "Jansen"
        assert user.password == "VeiligWachtwoord123"
        assert user.phone == "+31612345678"

    def test_user_create_schema_minimal(self):
        """Test creating user with only required fields."""
        user = UserCreate(
            email="maria@example.com",
            first_name="Maria",
            last_name="Voorzitter",
            password="MijnWachtwoord123",
        )
        
        assert user.phone is None

    def test_user_create_password_min_length(self):
        """Test password minimum length validation."""
        with pytest.raises(ValueError):
            UserCreate(
                email="test@example.com",
                first_name="Test",
                last_name="User",
                password="kort",  # Too short
            )

    def test_user_create_invalid_email(self):
        """Test email validation."""
        with pytest.raises(ValueError):
            UserCreate(
                email="geen-geldig-email",
                first_name="Test",
                last_name="User",
                password="WachtwoordOK123",
            )

    def test_user_create_first_name_not_empty(self):
        """Test first name cannot be empty."""
        with pytest.raises(ValueError):
            UserCreate(
                email="test@example.com",
                first_name="",
                last_name="User",
                password="WachtwoordOK123",
            )

    def test_user_create_last_name_not_empty(self):
        """Test last name cannot be empty."""
        with pytest.raises(ValueError):
            UserCreate(
                email="test@example.com",
                first_name="Test",
                last_name="",
                password="WachtwoordOK123",
            )


class TestLoginJourney:
    """Tests for Customer Journey: Login flow.
    
    STORY-005: Rol-gebaseerd inloggen
    - Bewoner ziet alleen eigen status
    - Status is zichtbaar op mobile-first dashboard
    - Meldingen zijn niet-blokkerend (toast/inline)
    """

    def test_login_request_schema(self):
        """Test login request schema."""
        login = LoginRequest(
            email="penningmeester@vve-zonnelaan.nl",
            password="MijnVeiligWachtwoord",
        )
        
        assert login.email == "penningmeester@vve-zonnelaan.nl"
        assert login.password == "MijnVeiligWachtwoord"

    def test_token_response_schema(self):
        """Test token response schema."""
        response = TokenResponse(
            access_token="eyJ...",
            refresh_token="eyJ...",
            token_type="bearer",
            expires_in=3600,
        )
        
        assert response.access_token == "eyJ..."
        assert response.token_type == "bearer"
        assert response.expires_in == 3600

    def test_refresh_token_request_schema(self):
        """Test refresh token request schema."""
        request = RefreshTokenRequest(
            refresh_token="eyJ..."
        )
        
        assert request.refresh_token == "eyJ..."


class TestPasswordManagementJourney:
    """Tests for password management flows."""

    def test_password_hashing_security(self):
        """Test password is securely hashed."""
        password = "MijnGeheimeWachtwoord123"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Each hash should be different (due to salt)
        assert hash1 != hash2
        
        # Both should verify correctly
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

    def test_password_change_request_schema(self):
        """Test password change request schema."""
        request = PasswordChangeRequest(
            current_password="OudWachtwoord",
            new_password="NieuwVeiligWachtwoord123",
        )
        
        assert request.current_password == "OudWachtwoord"
        assert request.new_password == "NieuwVeiligWachtwoord123"

    def test_password_change_new_password_min_length(self):
        """Test new password minimum length."""
        with pytest.raises(ValueError):
            PasswordChangeRequest(
                current_password="OudWachtwoord",
                new_password="kort",  # Too short
            )


class TestJWTTokenJourney:
    """Tests for JWT token flows - ensuring session persistence."""

    def test_access_token_contains_user_info(self):
        """Test access token contains required user info."""
        data = {
            "sub": "user-uuid-123",
            "email": "jan@example.com",
        }
        
        token = create_access_token(data)
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "user-uuid-123"
        assert payload["email"] == "jan@example.com"
        assert payload["type"] == "access"

    def test_refresh_token_is_different_type(self):
        """Test refresh token has different type."""
        data = {"sub": "user-uuid-123"}
        
        access = create_access_token(data)
        refresh = create_refresh_token(data)
        
        access_payload = decode_token(access)
        refresh_payload = decode_token(refresh)
        
        assert access_payload["type"] == "access"
        assert refresh_payload["type"] == "refresh"

    def test_token_expiration_custom(self):
        """Test token with custom expiration."""
        data = {"sub": "user-uuid-123"}
        
        token = create_access_token(data, expires_delta=timedelta(hours=2))
        payload = decode_token(token)
        
        assert payload is not None
        assert "exp" in payload

    def test_invalid_token_returns_none(self):
        """Test invalid token handling."""
        assert decode_token("invalid.token.value") is None
        assert decode_token("") is None
        assert decode_token("not-a-jwt") is None


class TestRoleBasedAccessJourney:
    """Tests for role-based access control.
    
    Customer journey roles:
    - Bewoner: Can view own status
    - Penningmeester: Financial management
    - Bestuurslid: Document and communication management
    - Beheerder: Full VVE management
    """

    def test_all_roles_defined(self):
        """Test all customer journey roles are defined."""
        assert UserRole.BEWONER.value == "bewoner"
        assert UserRole.PENNINGMEESTER.value == "penningmeester"
        assert UserRole.BESTUURSLID.value == "bestuurslid"
        assert UserRole.BEHEERDER.value == "beheerder"

    def test_beheerder_can_access_all(self):
        """Test beheerder has full access (VVE administrator)."""
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.BEWONER])
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.PENNINGMEESTER])
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.BESTUURSLID])
        assert has_role_permission(UserRole.BEHEERDER, [UserRole.BEHEERDER])

    def test_penningmeester_permissions(self):
        """Test penningmeester can access financial and bewoner features."""
        # Penningmeester can access bewoner features
        assert has_role_permission(UserRole.PENNINGMEESTER, [UserRole.BEWONER])
        assert has_role_permission(UserRole.PENNINGMEESTER, [UserRole.PENNINGMEESTER])
        
        # Penningmeester cannot access beheerder features
        assert not has_role_permission(UserRole.PENNINGMEESTER, [UserRole.BEHEERDER])

    def test_bestuurslid_permissions(self):
        """Test bestuurslid can access documents and bewoner features."""
        assert has_role_permission(UserRole.BESTUURSLID, [UserRole.BEWONER])
        assert has_role_permission(UserRole.BESTUURSLID, [UserRole.BESTUURSLID])
        
        # Bestuurslid cannot access beheerder features
        assert not has_role_permission(UserRole.BESTUURSLID, [UserRole.BEHEERDER])

    def test_bewoner_limited_access(self):
        """Test bewoner has limited access (own status only)."""
        # Bewoner can only access bewoner features
        assert has_role_permission(UserRole.BEWONER, [UserRole.BEWONER])
        
        # Bewoner cannot access higher roles
        assert not has_role_permission(UserRole.BEWONER, [UserRole.PENNINGMEESTER])
        assert not has_role_permission(UserRole.BEWONER, [UserRole.BESTUURSLID])
        assert not has_role_permission(UserRole.BEWONER, [UserRole.BEHEERDER])


class TestVVEMembershipJourney:
    """Tests for VVE membership management.
    
    Customer journey: Adding users to VVE with roles.
    """

    def test_vve_member_create_bewoner(self):
        """Test creating a bewoner membership."""
        import uuid
        
        member = VVEMemberCreate(
            user_id=uuid.uuid4(),
            role=SchemaUserRole.BEWONER,
            unit_id=uuid.uuid4(),
        )
        
        assert member.role == SchemaUserRole.BEWONER
        assert member.unit_id is not None

    def test_vve_member_create_bestuurslid(self):
        """Test creating a bestuurslid without unit."""
        import uuid
        
        member = VVEMemberCreate(
            user_id=uuid.uuid4(),
            role=SchemaUserRole.BESTUURSLID,
        )
        
        assert member.role == SchemaUserRole.BESTUURSLID
        assert member.unit_id is None

    def test_vve_member_update_role(self):
        """Test updating member role."""
        update = VVEMemberUpdate(
            role=SchemaUserRole.PENNINGMEESTER,
        )
        
        assert update.role == SchemaUserRole.PENNINGMEESTER
        assert update.unit_id is None
        assert update.is_active is None

    def test_vve_member_update_deactivate(self):
        """Test deactivating a member."""
        update = VVEMemberUpdate(
            is_active=False,
        )
        
        assert update.is_active is False

    def test_user_update_schema(self):
        """Test user profile update schema."""
        update = UserUpdate(
            first_name="Updated",
            phone="+31699999999",
        )
        
        assert update.first_name == "Updated"
        assert update.phone == "+31699999999"
        assert update.last_name is None
