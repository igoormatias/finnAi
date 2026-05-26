from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from core.slug import slugify, with_suffix
from domain.exceptions import ForbiddenException, WorkspaceNotFoundException
from domain.workspace_roles import WorkspaceRole
from models.user import User
from models.workspace import Workspace
from repositories.membership_repository import MembershipRepository
from repositories.workspace_repository import WorkspaceRepository


class WorkspaceService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._workspaces = WorkspaceRepository(session)
        self._memberships = MembershipRepository(session)

    async def create_workspace(self, user: User, name: str) -> Workspace:
        slug = await self._generate_unique_slug(name)
        workspace = await self._workspaces.create(name=name, slug=slug, owner_id=user.id)
        await self._memberships.add_member(
            workspace_id=workspace.id,
            user_id=user.id,
            role=WorkspaceRole.owner.value,
        )
        await self._session.commit()
        await self._session.refresh(workspace)
        return workspace

    async def list_workspaces(self, user: User) -> list[Workspace]:
        return await self._workspaces.list_by_user(user.id)

    async def get_workspace(self, slug: str) -> Workspace:
        workspace = await self._workspaces.get_by_slug(slug)
        if workspace is None:
            raise WorkspaceNotFoundException("Workspace not found")
        return workspace

    async def update_workspace(
        self,
        workspace: Workspace,
        *,
        name: str | None,
    ) -> Workspace:
        slug = None
        if name is not None:
            slug = await self._generate_unique_slug(name, exclude_workspace_id=workspace.id)
        updated = await self._workspaces.update(workspace, name=name, slug=slug)
        await self._session.commit()
        return updated

    async def delete_workspace(self, workspace: Workspace, actor: User) -> None:
        if workspace.owner_id != actor.id:
            raise ForbiddenException("Only the workspace owner can delete it")
        await self._workspaces.delete(workspace)
        await self._session.commit()

    async def _generate_unique_slug(
        self,
        name: str,
        *,
        exclude_workspace_id: uuid.UUID | None = None,
    ) -> str:
        base_slug = slugify(name)
        suffix = 1
        while True:
            candidate = with_suffix(base_slug, suffix)
            existing = await self._workspaces.get_by_slug(candidate)
            if existing is None or (
                exclude_workspace_id is not None and existing.id == exclude_workspace_id
            ):
                return candidate
            suffix += 1
