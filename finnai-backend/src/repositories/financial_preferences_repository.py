from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workspace_financial_preferences import WorkspaceFinancialPreferences


class FinancialPreferencesRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_workspace(self, workspace_id: uuid.UUID) -> WorkspaceFinancialPreferences | None:
        result = await self._session.execute(
            select(WorkspaceFinancialPreferences).where(
                WorkspaceFinancialPreferences.workspace_id == workspace_id
            )
        )
        return result.scalar_one_or_none()

    async def create_defaults(self, workspace_id: uuid.UUID) -> WorkspaceFinancialPreferences:
        prefs = WorkspaceFinancialPreferences(workspace_id=workspace_id)
        self._session.add(prefs)
        await self._session.flush()
        await self._session.refresh(prefs)
        return prefs

    async def update(
        self,
        prefs: WorkspaceFinancialPreferences,
        **fields: object,
    ) -> WorkspaceFinancialPreferences:
        for key, value in fields.items():
            if value is not None and hasattr(prefs, key):
                setattr(prefs, key, value)
        await self._session.flush()
        await self._session.refresh(prefs)
        return prefs
