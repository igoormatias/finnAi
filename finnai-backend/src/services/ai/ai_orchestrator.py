from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from domain.exceptions import AIParseException, AIProviderException
from integrations.ai.base import AIProvider
from models.workspace import Workspace
from models.workspace_financial_score import WorkspaceFinancialScore
from core.dates import current_month_range_utc
from repositories.analytics_repository import AnalyticsRepository
from repositories.financial_preferences_repository import FinancialPreferencesRepository
from repositories.goal_repository import GoalRepository
from services.emergency_reserve_service import EmergencyReserveService
from services.projection_service import ProjectionService
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

        completion = None
        try:
            snapshot = await self._build_snapshot(workspace)
            prompt = build_financial_score_prompt(input_payload=snapshot)

            completion = await self._provider.complete_json(prompt=prompt.prompt)
            payload = parse_score_json(completion.raw_text)

            if _looks_english(payload):
                # Retry once with a stronger instruction (no loops).
                reinforced_prompt = (
                    prompt.prompt
                    + "\nATENÇÃO: A saída DEVE estar 100% em português (pt-BR). "
                    "Se algum texto estiver em inglês, reescreva tudo em pt-BR.\n"
                )
                completion = await self._provider.complete_json(prompt=reinforced_prompt)
                payload = parse_score_json(completion.raw_text)
                if _looks_english(payload):
                    raise AIParseException("AI response not in pt-BR")
        except AIParseException as exc:
            if completion is not None:
                preview = completion.raw_text.strip()[:500]
                score_row.raw_response = {
                    **(completion.raw_json if isinstance(completion.raw_json, dict) else {}),
                    "parse_preview": preview,
                }
                await self._session.flush()
                raise AIParseException(f"{exc.message} | preview: {preview}") from exc
            raise
        except AIProviderException:
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
        now = datetime.now(timezone.utc)
        month_range = current_month_range_utc(now_utc=now, tz=tz)
        start = month_range.start
        end = month_range.end

        income, expense, tx_count = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace.id, start_date=start, end_date=end
        )
        biggest_income = await self._analytics.biggest_transaction(
            workspace_id=workspace.id, start_date=start, end_date=end, type="income"
        )
        biggest_expense = await self._analytics.biggest_transaction(
            workspace_id=workspace.id, start_date=start, end_date=end, type="expense"
        )
        total_balance = await self._analytics.total_balance_cents(workspace_id=workspace.id)

        cats_expense = await self._analytics.categories_breakdown(
            workspace_id=workspace.id, start_date=start, end_date=end, type="expense"
        )

        prefs_repo = FinancialPreferencesRepository(self._session)
        prefs = await prefs_repo.get_by_workspace(workspace.id)
        preferences = {
            "include_future_transactions": prefs.include_future_transactions if prefs else True,
            "include_past_transactions": prefs.include_past_transactions if prefs else True,
            "include_goals_in_projections": prefs.include_goals_in_projections if prefs else True,
            "include_recurrences_in_projections": prefs.include_recurrences_in_projections
            if prefs
            else True,
        }

        emergency = EmergencyReserveService(self._session)
        reserve = await emergency.get_reserve(workspace=workspace)

        projection = ProjectionService(self._session)
        projected_30d = await projection.projected_30d_summary(workspace=workspace)
        recurring_burn = await projection.recurring_monthly_burn_cents(workspace_id=workspace.id)

        goals_repo = GoalRepository(self._session)
        active_goals = [
            g
            for g in await goals_repo.list_by_workspace(workspace.id)
            if g.status == "active"
        ]
        goals_summary = [
            {
                "name": g.name,
                "goal_type": g.goal_type,
                "current_amount_cents": int(g.current_amount_cents),
                "target_amount_cents": int(g.target_amount_cents),
                "progress_percent": round(
                    min(100.0, (g.current_amount_cents / g.target_amount_cents) * 100)
                    if g.target_amount_cents > 0
                    else 0.0,
                    1,
                ),
            }
            for g in active_goals[:10]
        ]

        recurring_income_share = (
            0.0
            if income == 0
            else float(recurring_burn) / float(income)
        )

        return {
            "workspace_timezone": tz,
            "period_start": start.isoformat(),
            "period_end": end.isoformat(),
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
            "emergency_reserve": {
                "reserved_cents": reserve.reserved_cents,
                "target_months": reserve.target_months,
                "coverage_months": reserve.coverage_months,
                "avg_monthly_expense_cents": reserve.avg_monthly_expense_cents,
            },
            "recurring_monthly_burn_cents": int(recurring_burn),
            "recurring_income_share": float(recurring_income_share),
            "goals_summary": goals_summary,
            "projected_30d": projected_30d,
            "preferences": preferences,
        }


_ENGLISH_MARKERS = {
    "the",
    "and",
    "with",
    "you",
    "your",
    "health",
    "exceptional",
    "financial",
    "savings",
    "income",
    "expenses",
    "balance",
    "strong",
    "weakness",
    "tips",
}


def _looks_english(payload) -> bool:
    text = " ".join(
        [
            str(getattr(payload, "label", "")),
            str(getattr(payload, "summary", "")),
            " ".join(getattr(payload, "strengths", []) or []),
            " ".join(getattr(payload, "weaknesses", []) or []),
            " ".join(getattr(payload, "tips", []) or []),
            " ".join(getattr(payload, "badges", []) or []),
        ]
    ).lower()
    # Simple marker-based heuristic: if multiple common English tokens appear, treat as English.
    hits = sum(1 for w in _ENGLISH_MARKERS if f" {w} " in f" {text} ")
    return hits >= 2
