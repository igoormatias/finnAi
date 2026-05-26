from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from domain.exceptions import CategoryNotFoundException, ForbiddenException
from domain.finance import CategoryType
from models.category import Category
from models.workspace import Workspace
from repositories.category_repository import CategoryRepository


class CategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._categories = CategoryRepository(session)

    async def create_category(
        self,
        *,
        workspace: Workspace,
        name: str,
        type: CategoryType,
        color: str,
        icon: str,
        is_fixed: bool,
    ) -> Category:
        category = await self._categories.create(
            workspace_id=workspace.id,
            name=name.strip(),
            type=type.value,
            color=color,
            icon=icon,
            is_fixed=is_fixed,
        )
        await self._session.commit()
        return category

    async def list_categories(self, workspace: Workspace) -> list[Category]:
        return await self._categories.list_by_workspace(workspace.id)

    async def update_category(
        self,
        *,
        workspace: Workspace,
        category_id: uuid.UUID,
        name: str | None,
        color: str | None,
        icon: str | None,
        is_fixed: bool | None,
    ) -> Category:
        category = await self._categories.get_by_id(category_id)
        if category is None or category.workspace_id != workspace.id:
            raise CategoryNotFoundException("Category not found")
        if category.is_fixed:
            raise ForbiddenException("Fixed categories cannot be modified")

        updated = await self._categories.update(
            category,
            name=name.strip() if name is not None else None,
            color=color,
            icon=icon,
            is_fixed=is_fixed,
        )
        await self._session.commit()
        return updated

    async def delete_category(self, *, workspace: Workspace, category_id: uuid.UUID) -> None:
        category = await self._categories.get_by_id(category_id)
        if category is None or category.workspace_id != workspace.id:
            raise CategoryNotFoundException("Category not found")
        if category.is_fixed:
            raise ForbiddenException("Fixed categories cannot be deleted")
        await self._categories.delete(category)
        await self._session.commit()
