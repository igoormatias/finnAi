from __future__ import annotations

from dataclasses import dataclass

import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from core.database import get_sessionmaker
from domain.exceptions import AIScoreNotFoundException
from integrations.ai.base import AIProvider
from models.workspace import Workspace
from models.workspace_financial_score import WorkspaceFinancialScore
from repositories.workspace_repository import WorkspaceRepository
from services.ai.ai_cache_service import AIScoreCacheService
from services.ai.ai_orchestrator import AIOrchestrator


logger = logging.getLogger(__name__)

GENERATION_STUCK_SECONDS = 90


@dataclass(frozen=True)
class RegenerateResponse:
    status: str
    debounced: bool
    retries_remaining: int | None = None
    generation_epoch: int | None = None


class FinancialScoreService:
    def __init__(self, session: AsyncSession, settings: Settings, provider: AIProvider) -> None:
        self._session = session
        self._settings = settings
        self._provider = provider
        self._cache = AIScoreCacheService(session, settings)

    async def get_score(self, *, workspace: Workspace) -> WorkspaceFinancialScore:
        result = await self._session.execute(
            select(WorkspaceFinancialScore).where(
                WorkspaceFinancialScore.workspace_id == workspace.id
            )
        )
        score = result.scalar_one_or_none()
        if score is None:
            raise AIScoreNotFoundException("Financial score not generated yet")
        if is_generation_stuck(score, now_utc=datetime.now(timezone.utc), max_age_seconds=GENERATION_STUCK_SECONDS):
            await self._cache.mark_failed(score, "Job stuck (generation timed out)")
            await self._session.commit()
        if score.status == "idle" and not _is_score_populated(score):
            raise AIScoreNotFoundException("Financial score not generated yet")
        return score

    async def request_regenerate(self, *, workspace: Workspace) -> RegenerateResponse:
        score = await self._cache.get_or_create(workspace_id=workspace.id)
        now = datetime.now(timezone.utc)

        if score.status in ("pending", "running"):
            if is_generation_stuck(score, now_utc=now, max_age_seconds=GENERATION_STUCK_SECONDS):
                await self._cache.mark_failed(score, "Job stuck (generation timed out)")
            else:
                await self._session.commit()
                return RegenerateResponse(
                    status=score.status,
                    debounced=True,
                    retries_remaining=None,
                    generation_epoch=int(score.generation_epoch or 0),
                )

        if await self._cache.should_debounce(score):
            await self._session.commit()
            return RegenerateResponse(
                status=score.status,
                debounced=True,
                retries_remaining=self._cache.retries_remaining(score),
                generation_epoch=int(score.generation_epoch or 0),
            )

        epoch = await self._cache.mark_requested(score)
        await self._session.commit()
        return RegenerateResponse(
            status="pending",
            debounced=False,
            retries_remaining=None,
            generation_epoch=epoch,
        )

    async def run_regeneration_in_session(
        self, *, workspace: Workspace, expected_epoch: int
    ) -> None:
        orchestrator = AIOrchestrator(self._session, self._settings, self._provider)
        try:
            await orchestrator.generate_and_persist(
                workspace=workspace, expected_epoch=expected_epoch
            )
        except Exception as exc:  # noqa: BLE001
            score = await self._cache.get_or_create(workspace_id=workspace.id)
            await self._cache.mark_failed(score, str(exc), expected_epoch=expected_epoch)
            await self._session.commit()

    async def run_regeneration(self, *, workspace_id, expected_epoch: int) -> None:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as session:
            workspace = await WorkspaceRepository(session).get_by_id(workspace_id)
            if workspace is None:
                return
            orchestrator = AIOrchestrator(session, self._settings, self._provider)
            cache = AIScoreCacheService(session, self._settings)
            try:
                score = await cache.get_or_create(workspace_id=workspace.id)
                if int(score.generation_epoch or 0) != expected_epoch:
                    return
                await cache.mark_running(score)
                await session.commit()
                await orchestrator.generate_and_persist(
                    workspace=workspace, expected_epoch=expected_epoch
                )
            except Exception as exc:  # noqa: BLE001
                logger.exception(
                    "AI score regeneration failed", extra={"workspace_id": str(workspace_id)}
                )
                score = await cache.get_or_create(workspace_id=workspace.id)
                await cache.mark_failed(score, str(exc), expected_epoch=expected_epoch)
                await session.commit()


def is_generation_stuck(
    score: WorkspaceFinancialScore, *, now_utc: datetime, max_age_seconds: int
) -> bool:
    if score.status not in ("pending", "running"):
        return False
    if score.last_requested_at is None:
        return False
    last = score.last_requested_at
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    return (now_utc - last).total_seconds() > max_age_seconds


def _is_score_populated(score: WorkspaceFinancialScore) -> bool:
    return bool(score.label.strip()) and bool(score.summary.strip())
