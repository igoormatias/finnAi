from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query

from api.deps_analytics import AnalyticsServiceDep, DashboardServiceDep
from api.deps_workspaces import WorkspaceMemberDep
from core.dates import current_month_range_utc, previous_month_range_utc
from domain.finance import TransactionType
from schemas.analytics import (
    AccountsAnalyticsResponse,
    CashflowResponse,
    CategoryAnalyticsResponse,
    DashboardOverviewResponse,
    GranularityLiteral,
    TrendsResponse,
)

router = APIRouter(prefix="/workspaces/{slug}/dashboard", tags=["dashboard-v5"])


@router.get("/overview", response_model=DashboardOverviewResponse)
async def overview(
    context: WorkspaceMemberDep, dashboard: DashboardServiceDep
) -> DashboardOverviewResponse:
    o = await dashboard.overview(workspace=context.workspace)
    return DashboardOverviewResponse(
        total_balance_cents=o.total_balance_cents,
        monthly_income_cents=o.monthly_income_cents,
        monthly_expense_cents=o.monthly_expense_cents,
        savings_cents=o.savings_cents,
        savings_rate=o.savings_rate,
        transaction_count=o.transaction_count,
        biggest_expense=None
        if o.biggest_expense is None
        else {
            "id": o.biggest_expense.id,
            "amount_cents": o.biggest_expense.amount_cents,
            "description": o.biggest_expense.description,
        },
        biggest_income=None
        if o.biggest_income is None
        else {
            "id": o.biggest_income.id,
            "amount_cents": o.biggest_income.amount_cents,
            "description": o.biggest_income.description,
        },
    )


@router.get("/accounts", response_model=AccountsAnalyticsResponse)
async def accounts(
    context: WorkspaceMemberDep, dashboard: DashboardServiceDep
) -> AccountsAnalyticsResponse:
    items = await dashboard.accounts(workspace=context.workspace)
    return AccountsAnalyticsResponse(items=items)  # type: ignore[arg-type]


@router.get("/cashflow", response_model=CashflowResponse)
async def cashflow(
    context: WorkspaceMemberDep,
    analytics: AnalyticsServiceDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    granularity: Annotated[GranularityLiteral, Query()] = "daily",
) -> CashflowResponse:
    r = await analytics.cashflow(
        workspace=context.workspace,
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
    )
    return CashflowResponse(
        granularity=r.granularity,
        points=[p.__dict__ for p in r.points],  # type: ignore[arg-type]
    )


@router.get("/categories", response_model=CategoryAnalyticsResponse)
async def categories(
    context: WorkspaceMemberDep,
    analytics: AnalyticsServiceDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    type: Annotated[str, Query()] = "expense",
) -> CategoryAnalyticsResponse:
    r = await analytics.categories(
        workspace=context.workspace,
        start_date=start_date,
        end_date=end_date,
        type=TransactionType(type),
    )
    return CategoryAnalyticsResponse(
        type=r.type,
        items=[i.__dict__ for i in r.items],  # type: ignore[arg-type]
    )


@router.get("/trends", response_model=TrendsResponse)
async def trends(context: WorkspaceMemberDep, analytics: AnalyticsServiceDep) -> TrendsResponse:
    tz = context.workspace.timezone or "UTC"
    cur = current_month_range_utc(tz=tz)
    prev = previous_month_range_utc(tz=tz)
    r = await analytics.trends(
        workspace=context.workspace,
        current_start=cur.start,
        current_end=cur.end,
        previous_start=prev.start,
        previous_end=prev.end,
    )
    return TrendsResponse(**r.__dict__)
