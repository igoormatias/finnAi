from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from models.workspace import Workspace
from models.workspace_financial_preferences import WorkspaceFinancialPreferences
from repositories.financial_preferences_repository import FinancialPreferencesRepository
from schemas.financial_preferences import FinancialPreferencesResponse, FinancialPreferencesUpdate
from services.ai_stale_helper import mark_ai_score_stale


class FinancialPreferencesService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._prefs = FinancialPreferencesRepository(session)

    async def get_or_create(self, workspace: Workspace) -> WorkspaceFinancialPreferences:
        existing = await self._prefs.get_by_workspace(workspace.id)
        if existing is not None:
            return existing
        prefs = await self._prefs.create_defaults(workspace.id)
        await self._session.commit()
        await self._session.refresh(prefs)
        return prefs

    async def get_response(self, workspace: Workspace) -> FinancialPreferencesResponse:
        prefs = await self.get_or_create(workspace)
        return self._to_response(prefs)

    async def update(
        self, workspace: Workspace, body: FinancialPreferencesUpdate
    ) -> FinancialPreferencesResponse:
        prefs = await self.get_or_create(workspace)
        update_data = body.model_dump(exclude_unset=True)
        updated = await self._prefs.update(prefs, **update_data)
        await self._session.commit()
        await mark_ai_score_stale(self._session, workspace.id)
        return self._to_response(updated)

    @staticmethod
    def _to_response(prefs: WorkspaceFinancialPreferences) -> FinancialPreferencesResponse:
        return FinancialPreferencesResponse(
            emergency_reserve_target_months=prefs.emergency_reserve_target_months,
            include_future_transactions=prefs.include_future_transactions,
            include_past_transactions=prefs.include_past_transactions,
            include_goals_in_projections=prefs.include_goals_in_projections,
            include_recurrences_in_projections=prefs.include_recurrences_in_projections,
            default_dashboard_period=prefs.default_dashboard_period,  # type: ignore[arg-type]
            default_reports_period=prefs.default_reports_period,  # type: ignore[arg-type]
            default_reports_mode=prefs.default_reports_mode,  # type: ignore[arg-type]
        )
