from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.workspace import Workspace
from models.workspace_membership import WorkspaceMembership


class WorkspaceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def slug_exists(self, slug: str) -> bool:
        result = await self._session.execute(select(Workspace.id).where(Workspace.slug == slug))
        return result.scalar_one_or_none() is not None

    async def create(self, *, name: str, slug: str, owner_id: uuid.UUID) -> Workspace:
        workspace = Workspace(name=name, slug=slug, owner_id=owner_id)
        self._session.add(workspace)
        await self._session.flush()
        await self._session.refresh(workspace)
        return workspace

    async def get_by_slug(self, slug: str) -> Workspace | None:
        result = await self._session.execute(select(Workspace).where(Workspace.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_id(self, workspace_id: uuid.UUID) -> Workspace | None:
        result = await self._session.execute(select(Workspace).where(Workspace.id == workspace_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: uuid.UUID) -> list[Workspace]:
        stmt = (
            select(Workspace)
            .join(WorkspaceMembership, WorkspaceMembership.workspace_id == Workspace.id)
            .where(WorkspaceMembership.user_id == user_id)
            .options(selectinload(Workspace.memberships))
            .order_by(Workspace.created_at.desc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())

    async def update(
        self, workspace: Workspace, *, name: str | None, slug: str | None
    ) -> Workspace:
        if name is not None:
            workspace.name = name
        if slug is not None:
            workspace.slug = slug
        await self._session.flush()
        await self._session.refresh(workspace)
        return workspace

    async def delete(self, workspace: Workspace) -> None:
        await self._session.delete(workspace)
        await self._session.flush()
