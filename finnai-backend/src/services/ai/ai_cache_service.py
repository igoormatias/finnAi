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
        if (
            score.status == "failed"
            and score.failure_attempt_count <= self._settings.ai_score_failure_retry_limit
        ):
            return False

        if score.last_requested_at is None:
            return False
        last = score.last_requested_at
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - last < timedelta(
            seconds=self._settings.ai_score_debounce_seconds
        )

    def retries_remaining(self, score: WorkspaceFinancialScore) -> int | None:
        if score.status != "failed":
            return None
        return max(0, self._settings.ai_score_failure_retry_limit - score.failure_attempt_count)

    async def mark_requested(self, score: WorkspaceFinancialScore) -> int:
        score.last_requested_at = datetime.now(timezone.utc)
        score.status = "pending"
        score.last_error = None
        score.generation_epoch = int(score.generation_epoch or 0) + 1
        await self._session.flush()
        return int(score.generation_epoch)

    async def mark_running(self, score: WorkspaceFinancialScore) -> None:
        score.status = "running"
        score.last_error = None
        await self._session.flush()

    async def mark_failed(
        self,
        score: WorkspaceFinancialScore,
        error: str,
        *,
        expected_epoch: int | None = None,
    ) -> bool:
        if expected_epoch is not None and int(score.generation_epoch or 0) != expected_epoch:
            return False
        score.status = "failed"
        score.last_error = error[:1024]
        score.failure_attempt_count = int(score.failure_attempt_count or 0) + 1
        await self._session.flush()
        return True

    async def mark_success(
        self,
        score: WorkspaceFinancialScore,
        *,
        expected_epoch: int | None = None,
    ) -> bool:
        if expected_epoch is not None and int(score.generation_epoch or 0) != expected_epoch:
            return False
        score.status = "idle"
        score.last_error = None
        score.is_stale = False
        score.failure_attempt_count = 0
        await self._session.flush()
        return True

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
