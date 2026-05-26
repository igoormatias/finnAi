from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings, get_settings
from core.database import get_db_session


def settings_dep() -> Settings:
    return get_settings()


async def db_session_dep() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session


SettingsDep = Annotated[Settings, Depends(settings_dep)]
DbSessionDep = Annotated[AsyncSession, Depends(db_session_dep)]
