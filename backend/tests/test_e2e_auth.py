"""End-to-End tests for Authentication flow.

Tests the complete authentication flow including:
- CORS preflight (OPTIONS) requests
- Login validation
- Token refresh validation
- Get current user (/auth/me) authorization

These tests validate the frontend-to-backend communication pattern.
They do not require database connectivity for CORS and validation tests.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def allowed_origin():
    """Get the first allowed origin from settings."""
    settings = get_settings()
    return settings.allowed_origins[0] if settings.allowed_origins else "http://localhost:3000"


class TestCORSPreflight:
    """Test CORS preflight (OPTIONS) requests for authentication endpoints.
    
    These tests verify that the browser's preflight requests are handled correctly,
    which is essential for the frontend to communicate with the backend.
    
    CORS preflight requests do not require database connectivity.
    """

    def test_login_options_with_allowed_origin(self, client, allowed_origin):
        """Test OPTIONS request to /auth/login with allowed origin returns 200."""
        response = client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": allowed_origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == allowed_origin
        assert "POST" in response.headers.get("access-control-allow-methods", "")

    def test_login_options_without_origin_returns_405(self, client):
        """Test OPTIONS request without Origin header returns 405 Method Not Allowed."""
        response = client.options("/api/v1/auth/login")
        
        # Without Origin header, this is not a CORS preflight, so endpoint rules apply
        assert response.status_code == 405  # Method Not Allowed

    def test_register_options_with_allowed_origin(self, client, allowed_origin):
        """Test OPTIONS request to /auth/register with allowed origin returns 200."""
        response = client.options(
            "/api/v1/auth/register",
            headers={
                "Origin": allowed_origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == allowed_origin

    def test_me_options_with_allowed_origin(self, client, allowed_origin):
        """Test OPTIONS request to /auth/me with allowed origin returns 200."""
        response = client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": allowed_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == allowed_origin


class TestLoginValidation:
    """Test login endpoint request validation.
    
    STORY-005: Rol-gebaseerd inloggen
    These tests validate request format without requiring database.
    """

    def test_login_with_missing_email_returns_422(self, client, allowed_origin):
        """Test login with missing email returns 422 validation error."""
        response = client.post(
            "/api/v1/auth/login",
            json={"password": "somepassword"},
            headers={"Origin": allowed_origin}
        )
        
        assert response.status_code == 422

    def test_login_with_missing_password_returns_422(self, client, allowed_origin):
        """Test login with missing password returns 422 validation error."""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com"},
            headers={"Origin": allowed_origin}
        )
        
        assert response.status_code == 422

    def test_login_with_empty_body_returns_422(self, client, allowed_origin):
        """Test login with empty body returns 422 validation error."""
        response = client.post(
            "/api/v1/auth/login",
            json={},
            headers={"Origin": allowed_origin}
        )
        
        assert response.status_code == 422


class TestMeEndpoint:
    """Test the /auth/me endpoint behavior."""

    def test_me_without_token_returns_403(self, client, allowed_origin):
        """Test accessing /auth/me without token returns 403.
        
        FastAPI's HTTPBearer returns 403 Forbidden when no token is provided.
        """
        response = client.get(
            "/api/v1/auth/me",
            headers={"Origin": allowed_origin}
        )
        
        # HTTPBearer returns 403 when no credentials are provided
        assert response.status_code == 403

    def test_me_with_invalid_token_returns_401(self, client, allowed_origin):
        """Test accessing /auth/me with invalid token returns 401."""
        response = client.get(
            "/api/v1/auth/me",
            headers={
                "Origin": allowed_origin,
                "Authorization": "Bearer invalid-token"
            }
        )
        
        assert response.status_code == 401


class TestRefreshValidation:
    """Test the token refresh endpoint validation."""

    def test_refresh_with_invalid_token_returns_401(self, client, allowed_origin):
        """Test refresh with invalid token returns 401."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid-refresh-token"},
            headers={"Origin": allowed_origin}
        )
        
        assert response.status_code == 401

    def test_refresh_with_missing_token_returns_422(self, client, allowed_origin):
        """Test refresh with missing token returns 422."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={},
            headers={"Origin": allowed_origin}
        )
        
        assert response.status_code == 422


class TestCORSHeaders:
    """Test that CORS headers are correctly set on responses."""

    def test_validation_error_response_includes_cors_headers(self, client, allowed_origin):
        """Test that validation error response includes CORS headers."""
        response = client.post(
            "/api/v1/auth/login",
            json={},  # Invalid, will trigger 422
            headers={"Origin": allowed_origin}
        )
        
        # Even on validation error, CORS headers should be present
        assert response.headers.get("access-control-allow-origin") == allowed_origin
        assert response.headers.get("access-control-allow-credentials") == "true"

    def test_me_response_includes_cors_headers(self, client, allowed_origin):
        """Test that /auth/me response includes CORS headers."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Origin": allowed_origin}
        )
        
        # Even on error, CORS headers should be present
        assert response.headers.get("access-control-allow-origin") == allowed_origin
        assert response.headers.get("access-control-allow-credentials") == "true"
