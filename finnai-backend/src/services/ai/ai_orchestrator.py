from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from domain.exceptions import AIParseException, AIProviderException
from integrations.ai.base import AIProvider
from models.workspace import Workspace
from models.workspace_financial_score import WorkspaceFinancialScore
from repositories.analytics_repository import AnalyticsRepository
from services.ai.ai_cache_service import AIScoreCacheService
from services.ai.prompt_builder import build_financial_score_prompt
from services.ai.score_parser import parse_score_json


class AIOrchestrator:
    def __init__(self, session: AsyncSession, settings: Settings, provider: AIProvider) -> None:
        self._session = session
        self._settings = settings
        self._provider = provider
        self._analytics = AnalyticsRepository(session)
        self._cache = AIScoreCacheService(session, settings)

    async def generate_and_persist(self, *, workspace: Workspace) -> WorkspaceFinancialScore:
        score_row = await self._cache.get_or_create(workspace_id=workspace.id)

        await self._cache.mark_running(score_row)
        await self._session.commit()

        try:
            snapshot = await self._build_snapshot(workspace)
            prompt = build_financial_score_prompt(input_payload=snapshot)
            completion = await self._provider.complete_json(prompt=prompt.prompt)
            payload = parse_score_json(completion.raw_text)
        except (AIProviderException, AIParseException):
            raise
        except Exception as exc:  # noqa: BLE001
            raise AIProviderException("AI orchestration failed") from exc

        score_row.score = int(payload.score)
        score_row.label = payload.label
        score_row.summary = payload.summary
        score_row.strengths = payload.strengths
        score_row.weaknesses = payload.weaknesses
        score_row.tips = payload.tips
        score_row.badges = payload.badges
        score_row.generated_at = datetime.now(timezone.utc)
        score_row.raw_response = completion.raw_json
        score_row.provider = self._settings.ai_provider
        score_row.model = completion.model

        await self._cache.mark_success(score_row)
        await self._session.commit()
        await self._session.refresh(score_row)
        return score_row

    async def _build_snapshot(self, workspace: Workspace) -> dict:
        tz = workspace.timezone or "UTC"
        # Current month aggregates in UTC range (service-level uses tz; keep minimal here)
        now = datetime.now(timezone.utc)
        start = datetime(year=now.year, month=now.month, day=1, tzinfo=timezone.utc)
        income, expense, tx_count = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace.id, start_date=start, end_date=now
        )
        biggest_income = await self._analytics.biggest_transaction(
            workspace_id=workspace.id, start_date=start, end_date=now, type="income"
        )
        biggest_expense = await self._analytics.biggest_transaction(
            workspace_id=workspace.id, start_date=start, end_date=now, type="expense"
        )
        total_balance = await self._analytics.total_balance_cents(workspace_id=workspace.id)

        cats_expense = await self._analytics.categories_breakdown(
            workspace_id=workspace.id, start_date=start, end_date=now, type="expense"
        )

        return {
            "workspace_timezone": tz,
            "total_balance_cents": int(total_balance),
            "monthly_income_cents": int(income),
            "monthly_expense_cents": int(expense),
            "monthly_savings_cents": int(income - expense),
            "savings_rate": 0.0 if income == 0 else float(income - expense) / float(income),
            "transaction_count": int(tx_count),
            "biggest_income": None
            if biggest_income is None
            else {"amount_cents": int(biggest_income[1]), "description": biggest_income[2]},
            "biggest_expense": None
            if biggest_expense is None
            else {"amount_cents": int(biggest_expense[1]), "description": biggest_expense[2]},
            "top_expense_categories": [
                {"name": name, "total_cents": int(total)} for _, name, total in cats_expense[:5]
            ],
        }
