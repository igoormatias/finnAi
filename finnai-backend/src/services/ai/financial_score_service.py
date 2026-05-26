from __future__ import annotations

from dataclasses import dataclass

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


@dataclass(frozen=True)
class RegenerateResponse:
    status: str
    debounced: bool


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
        return score

    async def request_regenerate(self, *, workspace: Workspace) -> RegenerateResponse:
        score = await self._cache.get_or_create(workspace_id=workspace.id)
        if await self._cache.should_debounce(score):
            await self._session.commit()
            return RegenerateResponse(status=score.status, debounced=True)

        await self._cache.mark_requested(score)
        await self._session.commit()
        return RegenerateResponse(status="pending", debounced=False)

    async def run_regeneration_in_session(self, *, workspace: Workspace) -> None:
        orchestrator = AIOrchestrator(self._session, self._settings, self._provider)
        try:
            await orchestrator.generate_and_persist(workspace=workspace)
        except Exception as exc:  # noqa: BLE001
            score = await self._cache.get_or_create(workspace_id=workspace.id)
            await self._cache.mark_failed(score, str(exc))
            await self._session.commit()

    async def run_regeneration(self, *, workspace_id) -> None:
        sessionmaker = get_sessionmaker()
        async with sessionmaker() as session:
            workspace = await WorkspaceRepository(session).get_by_id(workspace_id)
            if workspace is None:
                return
            orchestrator = AIOrchestrator(session, self._settings, self._provider)
            cache = AIScoreCacheService(session, self._settings)
            try:
                await orchestrator.generate_and_persist(workspace=workspace)
            except Exception as exc:  # noqa: BLE001
                score = await cache.get_or_create(workspace_id=workspace.id)
                await cache.mark_failed(score, str(exc))
                await session.commit()
