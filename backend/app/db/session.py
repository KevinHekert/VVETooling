"""Database connection and session management.

Implements ADR-003 (Multi-tenancy with PostgreSQL RLS).
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# Create async engine with connection pooling
engine = create_async_engine(
    settings.database_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=True,  # Health check connections
    echo=settings.debug,  # Log SQL statements in debug mode
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


async def get_db() -> AsyncSession:
    """Dependency for getting database sessions.

    Yields an async database session that will be automatically
    closed after the request completes.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def set_tenant_context(session: AsyncSession, tenant_id: str) -> None:
    """Set the tenant context for Row-Level Security (RLS).

    This implements data isolation as per ADR-003.
    Must be called before any data operations.

    Args:
        session: The database session
        tenant_id: The VVE ID to set as current tenant
    """
    await session.execute(
        f"SET app.current_tenant_id = '{tenant_id}'"  # noqa: S608
    )
