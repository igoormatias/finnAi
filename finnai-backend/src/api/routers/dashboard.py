from __future__ import annotations

from fastapi import APIRouter

from api.deps import DbSessionDep
from api.deps_workspaces import WorkspaceMemberDep
from schemas.finance import DashboardSummaryResponse
from services.financial_summary_service import FinancialSummaryService

router = APIRouter(prefix="/workspaces/{slug}/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def dashboard_summary(
    context: WorkspaceMemberDep, session: DbSessionDep
) -> DashboardSummaryResponse:
    summary = await FinancialSummaryService(session).dashboard_summary(workspace=context.workspace)
    return DashboardSummaryResponse(
        total_balance_cents=summary.total_balance_cents,
        total_incomes_cents=summary.total_incomes_cents,
        total_expenses_cents=summary.total_expenses_cents,
        monthly_balance_cents=summary.monthly_balance_cents,
        savings_rate=summary.savings_rate,
    )
