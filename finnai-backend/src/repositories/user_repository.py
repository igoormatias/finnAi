from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self._session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_google_id(self, google_id: str) -> User | None:
        result = await self._session.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        google_id: str,
        email: str,
        name: str,
        avatar_url: str | None,
    ) -> User:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
            is_active=True,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def update_profile(
        self,
        user: User,
        *,
        name: str,
        avatar_url: str | None,
    ) -> User:
        user.name = name
        user.avatar_url = avatar_url
        await self._session.flush()
        await self._session.refresh(user)
        return user
