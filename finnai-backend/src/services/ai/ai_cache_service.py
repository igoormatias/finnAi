from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from models.workspace_financial_score import WorkspaceFinancialScore


class AIScoreCacheService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings

    async def get_or_create(self, *, workspace_id: uuid.UUID) -> WorkspaceFinancialScore:
        result = await self._session.execute(
            select(WorkspaceFinancialScore).where(
                WorkspaceFinancialScore.workspace_id == workspace_id
            )
        )
        existing = result.scalar_one_or_none()
        if existing is not None:
            return existing
        score = WorkspaceFinancialScore(workspace_id=workspace_id)
        self._session.add(score)
        await self._session.flush()
        await self._session.refresh(score)
        return score

    async def should_debounce(self, score: WorkspaceFinancialScore) -> bool:
        if score.last_requested_at is None:
            return False
        last = score.last_requested_at
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - last < timedelta(
            seconds=self._settings.ai_score_debounce_seconds
        )

    async def mark_requested(self, score: WorkspaceFinancialScore) -> None:
        score.last_requested_at = datetime.now(timezone.utc)
        score.status = "pending"
        score.last_error = None
        await self._session.flush()

    async def mark_running(self, score: WorkspaceFinancialScore) -> None:
        score.status = "running"
        await self._session.flush()

    async def mark_failed(self, score: WorkspaceFinancialScore, error: str) -> None:
        score.status = "failed"
        score.last_error = error[:1024]
        await self._session.flush()

    async def mark_success(self, score: WorkspaceFinancialScore) -> None:
        score.status = "idle"
        score.last_error = None
        score.is_stale = False
        await self._session.flush()

    async def mark_stale(self, *, workspace_id: uuid.UUID) -> None:
        result = await self._session.execute(
            select(WorkspaceFinancialScore).where(
                WorkspaceFinancialScore.workspace_id == workspace_id
            )
        )
        score = result.scalar_one_or_none()
        if score is None:
            return
        score.is_stale = True
        await self._session.flush()
