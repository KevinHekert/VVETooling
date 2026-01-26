"""Tests for health and system endpoints."""

from fastapi.testclient import TestClient

from app.main import app


def test_health_check():
    """Test that health endpoint returns healthy status."""
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_endpoint():
    """Test that root endpoint returns API information."""
    client = TestClient(app)
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "VVE Tooling API"
    assert "version" in data
    assert data["docs"] == "/docs"


def test_openapi_schema():
    """Test that OpenAPI schema is available."""
    client = TestClient(app)
    response = client.get("/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    assert data["info"]["title"] == "VVE Tooling API"
    assert "paths" in data
