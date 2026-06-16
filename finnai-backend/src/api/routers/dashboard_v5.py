from __future__ import annotations

from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from api.deps import DbSessionDep
from api.deps_analytics import AnalyticsServiceDep, DashboardServiceDep
from api.deps_workspaces import WorkspaceMemberDep
from core.dates import DateRange, current_month_range_utc, previous_month_range_utc
from domain.date_presets import PeriodPreset, resolve_period
from domain.finance import TransactionType
from schemas.analytics import (
    AccountsAnalyticsResponse,
    CashflowResponse,
    CategoryAnalyticsResponse,
    DashboardOverviewResponse,
    EmergencyReserveResponse,
    GranularityLiteral,
    MonthlyExpensePointResponse,
    MonthlyExpensesResponse,
    ProjectedCashflowPointResponse,
    ProjectedCashflowResponse,
    TrendsResponse,
)
from services.emergency_reserve_service import EmergencyReserveService
from services.projection_service import ProjectionService

router = APIRouter(prefix="/workspaces/{slug}/dashboard", tags=["dashboard-v5"])


def _emergency_service(session: DbSessionDep) -> EmergencyReserveService:
    return EmergencyReserveService(session)


def _projection_service(session: DbSessionDep) -> ProjectionService:
    return ProjectionService(session)


EmergencyServiceDep = Annotated[EmergencyReserveService, Depends(_emergency_service)]
ProjectionServiceDep = Annotated[ProjectionService, Depends(_projection_service)]


def _resolve_optional_period(
    *,
    workspace_tz: str,
    period: PeriodPreset | None,
    start_date: datetime | None,
    end_date: datetime | None,
) -> resolve_period.__annotations__["return"]:
    if period == "custom" or (period is None and start_date and end_date):
        if start_date is None or end_date is None:
            raise ValueError("custom period requires start_date and end_date")
        return resolve_period(
            preset="custom",
            tz=workspace_tz,
            custom_start=start_date,
            custom_end=end_date,
        )
    preset: PeriodPreset = period or "this_month"
    return resolve_period(preset=preset, tz=workspace_tz)


@router.get("/overview", response_model=DashboardOverviewResponse)
async def overview(
    context: WorkspaceMemberDep,
    dashboard: DashboardServiceDep,
    period: Annotated[PeriodPreset | None, Query()] = None,
    start_date: Annotated[datetime | None, Query()] = None,
    end_date: Annotated[datetime | None, Query()] = None,
) -> DashboardOverviewResponse:
    if period is None and start_date is None and end_date is None:
        o = await dashboard.overview(workspace=context.workspace)
    else:
        tz = context.workspace.timezone or "UTC"
        resolved = _resolve_optional_period(
            workspace_tz=tz, period=period, start_date=start_date, end_date=end_date
        )
        o = await dashboard.overview_for_range(
            workspace=context.workspace,
            date_range=DateRange(start=resolved.start, end=resolved.end),
        )
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
    period: Annotated[PeriodPreset | None, Query()] = None,
) -> CashflowResponse:
    tz = context.workspace.timezone or "UTC"
    if period is not None:
        resolved = resolve_period(preset=period, tz=tz)
        start_date = resolved.start
        end_date = resolved.end
        granularity = resolved.granularity  # type: ignore[assignment]
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
    period: Annotated[PeriodPreset | None, Query()] = None,
) -> CategoryAnalyticsResponse:
    tz = context.workspace.timezone or "UTC"
    if period is not None:
        resolved = resolve_period(preset=period, tz=tz)
        start_date = resolved.start
        end_date = resolved.end
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
async def trends(
    context: WorkspaceMemberDep,
    analytics: AnalyticsServiceDep,
    period: Annotated[PeriodPreset | None, Query()] = None,
    start_date: Annotated[datetime | None, Query()] = None,
    end_date: Annotated[datetime | None, Query()] = None,
) -> TrendsResponse:
    tz = context.workspace.timezone or "UTC"
    if period is None and start_date is None and end_date is None:
        cur = current_month_range_utc(tz=tz)
        prev = previous_month_range_utc(tz=tz)
    else:
        resolved = _resolve_optional_period(
            workspace_tz=tz, period=period or "this_month", start_date=start_date, end_date=end_date
        )
        cur_start = resolved.start
        cur_end = resolved.end
        span = cur_end - cur_start
        prev_end = cur_start - timedelta(microseconds=1)
        prev_start = prev_end - span
        cur = DateRange(start=cur_start, end=cur_end)
        prev = DateRange(start=prev_start, end=prev_end)

    r = await analytics.trends(
        workspace=context.workspace,
        current_start=cur.start,
        current_end=cur.end,
        previous_start=prev.start,
        previous_end=prev.end,
    )
    return TrendsResponse(**r.__dict__)


@router.get("/emergency-reserve", response_model=EmergencyReserveResponse)
async def emergency_reserve(
    context: WorkspaceMemberDep,
    service: EmergencyServiceDep,
) -> EmergencyReserveResponse:
    result = await service.get_reserve(workspace=context.workspace)
    return EmergencyReserveResponse(
        reserved_cents=result.reserved_cents,
        avg_monthly_expense_cents=result.avg_monthly_expense_cents,
        target_cents=result.target_cents,
        target_months=result.target_months,
        coverage_months=result.coverage_months,
        has_emergency_goal=result.has_emergency_goal,
        goal_id=__import__("uuid").UUID(result.goal_id) if result.goal_id else None,
    )


@router.get("/monthly-expenses", response_model=MonthlyExpensesResponse)
async def monthly_expenses(
    context: WorkspaceMemberDep,
    service: EmergencyServiceDep,
    months: Annotated[int, Query(ge=1, le=24)] = 12,
) -> MonthlyExpensesResponse:
    items = await service.monthly_expenses(workspace=context.workspace, months=months)
    return MonthlyExpensesResponse(
        items=[
            MonthlyExpensePointResponse(
                month=i.month,
                expense_cents=i.expense_cents,
                income_cents=i.income_cents,
                vs_previous_percent=i.vs_previous_percent,
            )
            for i in items
        ]
    )


def _projected_response(result) -> ProjectedCashflowResponse:
    return ProjectedCashflowResponse(
        granularity=result.granularity,  # type: ignore[arg-type]
        points=[
            ProjectedCashflowPointResponse(
                bucket_start=p.bucket_start,
                income_cents=p.income_cents,
                expense_cents=p.expense_cents,
                cumulative_balance_cents=p.cumulative_balance_cents,
                is_projected=p.is_projected,
            )
            for p in result.points
        ],
        projected_income_cents=result.projected_income_cents,
        projected_expense_cents=result.projected_expense_cents,
        projected_balance_delta_cents=result.projected_balance_delta_cents,
    )


@router.get("/cashflow/projected", response_model=ProjectedCashflowResponse)
async def cashflow_projected(
    context: WorkspaceMemberDep,
    projection: ProjectionServiceDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    granularity: Annotated[GranularityLiteral, Query()] = "daily",
    period: Annotated[PeriodPreset | None, Query()] = None,
) -> ProjectedCashflowResponse:
    tz = context.workspace.timezone or "UTC"
    if period is not None:
        resolved = resolve_period(preset=period, tz=tz)
        start_date = resolved.start
        end_date = resolved.end
        granularity = resolved.granularity  # type: ignore[assignment]
    result = await projection.projected_cashflow(
        workspace=context.workspace,
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        mode="projected",
    )
    return _projected_response(result)


@router.get("/cashflow/combined", response_model=ProjectedCashflowResponse)
async def cashflow_combined(
    context: WorkspaceMemberDep,
    projection: ProjectionServiceDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    granularity: Annotated[GranularityLiteral, Query()] = "daily",
    period: Annotated[PeriodPreset | None, Query()] = None,
) -> ProjectedCashflowResponse:
    tz = context.workspace.timezone or "UTC"
    if period is not None:
        resolved = resolve_period(preset=period, tz=tz)
        start_date = resolved.start
        end_date = resolved.end
        granularity = resolved.granularity  # type: ignore[assignment]
    result = await projection.projected_cashflow(
        workspace=context.workspace,
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        mode="complete",
    )
    return _projected_response(result)
