"""Application configuration using Pydantic Settings.

Based on ADR-001 (Authentication & Authorization) and ADR-003 (Multi-tenancy).
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "VVE Tooling API"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"

    # API Configuration
    api_prefix: str = "/api/v1"
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database (PostgreSQL - ADR-003)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vvetooling"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Authentication (AWS Cognito - ADR-001)
    cognito_region: str = "eu-central-1"
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""
    cognito_client_secret: str = ""

    # JWT Configuration (for local development/testing)
    jwt_secret_key: str = "development-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # AWS S3 Storage (Document Storage - FEAT-011)
    s3_bucket_name: str = "vvetooling-documents"
    s3_region: str = "eu-central-1"
    max_upload_size_mb: int = 50  # D-004: Storage limits

    # Rate Limiting
    rate_limit_requests_per_minute: int = 100

    class Config:
        """Pydantic settings configuration."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
