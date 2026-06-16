from __future__ import annotations

from collections.abc import AsyncGenerator
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from core.config import AppEnvironment, get_settings

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def _async_database_url_and_connect_args(
    database_url: str,
    *,
    app_env: AppEnvironment,
) -> tuple[str, dict[str, object]]:
    """asyncpg uses connect(ssl=...), not sslmode= in the URL."""
    parsed = urlparse(database_url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    connect_args: dict[str, object] = {}

    sslmode = query.pop("sslmode", None)
    ssl_query = query.pop("ssl", None)
    if sslmode == "require" or ssl_query in ("require", "true", "1"):
        connect_args["ssl"] = True
    elif app_env == AppEnvironment.production:
        connect_args["ssl"] = True

    cleaned_url = urlunparse(parsed._replace(query=urlencode(query)))
    return cleaned_url, connect_args


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        settings = get_settings()
        database_url, connect_args = _async_database_url_and_connect_args(
            settings.database_url,
            app_env=settings.app_env,
        )
        _engine = create_async_engine(
            database_url,
            connect_args=connect_args,
            pool_pre_ping=True,
        )
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _sessionmaker


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    get_engine()


async def close_db() -> None:
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
