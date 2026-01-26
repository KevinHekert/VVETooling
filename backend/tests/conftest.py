"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create mock authorization headers for testing."""
    # In real tests, this would create a valid JWT token
    return {"Authorization": "Bearer test-token"}
