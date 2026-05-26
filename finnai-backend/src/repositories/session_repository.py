from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.auth_session import AuthSession


class SessionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, session_id: uuid.UUID) -> AuthSession | None:
        result = await self._session.execute(
            select(AuthSession).where(AuthSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_by_token_hash(self, token_hash: str) -> AuthSession | None:
        result = await self._session.execute(
            select(AuthSession).where(AuthSession.refresh_token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        refresh_token_hash: str,
        expires_at: datetime,
    ) -> AuthSession:
        auth_session = AuthSession(
            id=session_id,
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
        )
        self._session.add(auth_session)
        await self._session.flush()
        await self._session.refresh(auth_session)
        return auth_session

    async def revoke(self, auth_session: AuthSession, revoked_at: datetime) -> None:
        auth_session.revoked_at = revoked_at
        await self._session.flush()
