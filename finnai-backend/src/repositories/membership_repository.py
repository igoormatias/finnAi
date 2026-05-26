from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.workspace_membership import WorkspaceMembership


class MembershipRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_member(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceMembership | None:
        result = await self._session.execute(
            select(WorkspaceMembership).where(
                WorkspaceMembership.workspace_id == workspace_id,
                WorkspaceMembership.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, membership_id: uuid.UUID) -> WorkspaceMembership | None:
        result = await self._session.execute(
            select(WorkspaceMembership).where(WorkspaceMembership.id == membership_id)
        )
        return result.scalar_one_or_none()

    async def list_members(self, workspace_id: uuid.UUID) -> list[WorkspaceMembership]:
        result = await self._session.execute(
            select(WorkspaceMembership)
            .where(WorkspaceMembership.workspace_id == workspace_id)
            .options(selectinload(WorkspaceMembership.user))
            .order_by(WorkspaceMembership.created_at.asc())
        )
        return list(result.scalars().all())

    async def add_member(
        self,
        *,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        role: str,
    ) -> WorkspaceMembership:
        membership = WorkspaceMembership(workspace_id=workspace_id, user_id=user_id, role=role)
        self._session.add(membership)
        await self._session.flush()
        await self._session.refresh(membership)
        return membership

    async def update_role(self, membership: WorkspaceMembership, role: str) -> WorkspaceMembership:
        membership.role = role
        await self._session.flush()
        await self._session.refresh(membership)
        return membership

    async def remove_member(self, membership: WorkspaceMembership) -> None:
        await self._session.delete(membership)
        await self._session.flush()
