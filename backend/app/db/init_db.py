"""Initialize database tables for development and local environments."""

from __future__ import annotations

import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.models import models as _models  # noqa: F401
from app.db.session import Base, engine

logger = logging.getLogger(__name__)


async def init_db(async_engine: AsyncEngine) -> None:
    """Create all tables using SQLAlchemy metadata."""
    async with async_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


def main() -> None:
    """Run database initialization as a script."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Creating database tables...")
    asyncio.run(init_db(engine))
    logger.info("Database tables created.")


if __name__ == "__main__":
    main()
