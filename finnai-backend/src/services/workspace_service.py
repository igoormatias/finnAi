from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from core.slug import slugify, with_suffix
from domain.exceptions import ForbiddenException, WorkspaceNotFoundException
from domain.workspace_roles import WorkspaceRole
from models.user import User
from models.workspace import Workspace
from repositories.category_repository import CategoryRepository
from repositories.membership_repository import MembershipRepository
from repositories.workspace_repository import WorkspaceRepository
from services.default_categories import DEFAULT_CATEGORIES


class WorkspaceService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._workspaces = WorkspaceRepository(session)
        self._memberships = MembershipRepository(session)
        self._categories = CategoryRepository(session)

    async def create_workspace(self, user: User, name: str) -> Workspace:
        slug = await self._generate_unique_slug(name)
        workspace = await self._workspaces.create(name=name, slug=slug, owner_id=user.id)
        await self._memberships.add_member(
            workspace_id=workspace.id,
            user_id=user.id,
            role=WorkspaceRole.owner.value,
        )
        # Seed default finance categories. This is safe to run even if a retry happens,
        # because categories have a unique constraint and we ignore duplicates.
        for cat in DEFAULT_CATEGORIES:
            try:
                async with self._session.begin_nested():
                    await self._categories.create(
                        workspace_id=workspace.id,
                        name=cat.name,
                        type=cat.type,
                        color=cat.color,
                        icon=cat.icon,
                        is_fixed=cat.is_fixed,
                    )
            except IntegrityError:
                # Duplicate category (e.g. retry or concurrency) – ignore.
                continue
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
        timezone: str | None,
    ) -> Workspace:
        slug = None
        if name is not None:
            slug = await self._generate_unique_slug(name, exclude_workspace_id=workspace.id)
        updated = await self._workspaces.update(workspace, name=name, slug=slug, timezone=timezone)
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
