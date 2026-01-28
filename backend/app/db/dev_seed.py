"""Seed development data for local environments."""

from __future__ import annotations

import logging

from asyncpg.exceptions import UndefinedTableError
from sqlalchemy import select
from sqlalchemy.exc import OperationalError, ProgrammingError

from app.core.config import get_settings
from app.core.security import UserRole, get_password_hash
from app.db.models.models import User, VVE, VVEMember
from app.db.session import async_session_maker

logger = logging.getLogger(__name__)


async def ensure_dev_admin() -> None:
    """Ensure a default admin user and VVE exist in development."""
    settings = get_settings()
    if settings.environment != "development":
        return

    try:
        async with async_session_maker() as session:
            async with session.begin():
                user_result = await session.execute(
                    select(User).where(User.email == settings.dev_admin_email)
                )
                user = user_result.scalar_one_or_none()
                if user is None:
                    user = User(
                        email=settings.dev_admin_email,
                        hashed_password=get_password_hash(
                            settings.dev_admin_password
                        ),
                        first_name=settings.dev_admin_first_name,
                        last_name=settings.dev_admin_last_name,
                        is_active=True,
                        is_email_verified=True,
                    )
                    session.add(user)
                    await session.flush()

                vve_result = await session.execute(
                    select(VVE).where(VVE.name == settings.dev_admin_vve_name)
                )
                vve = vve_result.scalar_one_or_none()
                if vve is None:
                    vve = VVE(name=settings.dev_admin_vve_name, is_active=True)
                    session.add(vve)
                    await session.flush()

                membership_result = await session.execute(
                    select(VVEMember).where(
                        VVEMember.user_id == user.id,
                        VVEMember.vve_id == vve.id,
                    )
                )
                membership = membership_result.scalar_one_or_none()
                if membership is None:
                    session.add(
                        VVEMember(
                            user_id=user.id,
                            vve_id=vve.id,
                            role=UserRole.BEHEERDER,
                            is_active=True,
                        )
                    )
    except OperationalError as exc:
        logger.warning(
            "Skipping dev seed because database is unavailable.",
            exc_info=exc,
        )
        return
    except ProgrammingError as exc:
        if isinstance(exc.orig, UndefinedTableError):
            logger.warning(
                "Skipping dev seed because database schema is missing. "
                "Run migrations or initialize tables.",
                exc_info=exc,
            )
            return
        raise

    logger.info("Dev admin ensured for %s", settings.dev_admin_email)
