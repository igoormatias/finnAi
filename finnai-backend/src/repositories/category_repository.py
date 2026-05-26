from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.category import Category


class CategoryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        name: str,
        type: str,
        color: str,
        icon: str,
        is_fixed: bool,
    ) -> Category:
        category = Category(
            workspace_id=workspace_id,
            name=name,
            type=type,
            color=color,
            icon=icon,
            is_fixed=is_fixed,
        )
        self._session.add(category)
        await self._session.flush()
        await self._session.refresh(category)
        return category

    async def get_by_id(self, category_id: uuid.UUID) -> Category | None:
        result = await self._session.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[Category]:
        result = await self._session.execute(
            select(Category)
            .where(Category.workspace_id == workspace_id)
            .order_by(Category.type.asc(), Category.name.asc())
        )
        return list(result.scalars().all())

    async def update(
        self,
        category: Category,
        *,
        name: str | None,
        color: str | None,
        icon: str | None,
        is_fixed: bool | None,
    ) -> Category:
        if name is not None:
            category.name = name
        if color is not None:
            category.color = color
        if icon is not None:
            category.icon = icon
        if is_fixed is not None:
            category.is_fixed = is_fixed
        await self._session.flush()
        await self._session.refresh(category)
        return category

    async def delete(self, category: Category) -> None:
        await self._session.delete(category)
        await self._session.flush()
