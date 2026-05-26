from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from core.cache.base import AnalyticsCache
from core.dates import normalize_range_to_utc
from domain.finance import TransactionType
from models.workspace import Workspace
from repositories.analytics_repository import AnalyticsRepository


@dataclass(frozen=True)
class CashflowPoint:
    bucket_start: datetime
    income_cents: int
    expense_cents: int
    cumulative_balance_cents: int


@dataclass(frozen=True)
class CashflowResult:
    granularity: str
    points: list[CashflowPoint]


@dataclass(frozen=True)
class CategoryBreakdownItem:
    category_id: str
    name: str
    total_cents: int
    percent: float


@dataclass(frozen=True)
class CategoryAnalyticsResult:
    type: str
    items: list[CategoryBreakdownItem]


@dataclass(frozen=True)
class TrendsResult:
    current_income_cents: int
    current_expense_cents: int
    previous_income_cents: int
    previous_expense_cents: int
    income_growth_rate: float
    expense_growth_rate: float


class AnalyticsService:
    def __init__(self, session: AsyncSession, cache: AnalyticsCache) -> None:
        self._session = session
        self._cache = cache
        self._analytics = AnalyticsRepository(session)

    async def cashflow(
        self,
        *,
        workspace: Workspace,
        start_date: datetime,
        end_date: datetime,
        granularity: str,
    ) -> CashflowResult:
        tz = workspace.timezone or "UTC"
        dr = normalize_range_to_utc(start=start_date, end=end_date, tz=tz)
        rows = await self._analytics.cashflow_series(
            workspace_id=workspace.id,
            start_date=dr.start,
            end_date=dr.end,
            granularity=granularity,
            tz=tz,
        )
        cumulative = 0
        points: list[CashflowPoint] = []
        for bucket_start, inc, exp in rows:
            cumulative += int(inc) - int(exp)
            points.append(
                CashflowPoint(
                    bucket_start=bucket_start,
                    income_cents=int(inc),
                    expense_cents=int(exp),
                    cumulative_balance_cents=int(cumulative),
                )
            )
        return CashflowResult(granularity=granularity, points=points)

    async def categories(
        self,
        *,
        workspace: Workspace,
        start_date: datetime,
        end_date: datetime,
        type: TransactionType,
    ) -> CategoryAnalyticsResult:
        tz = workspace.timezone or "UTC"
        dr = normalize_range_to_utc(start=start_date, end=end_date, tz=tz)
        rows = await self._analytics.categories_breakdown(
            workspace_id=workspace.id,
            start_date=dr.start,
            end_date=dr.end,
            type=type.value,
        )
        total = sum(total_cents for _, _, total_cents in rows)
        items: list[CategoryBreakdownItem] = []
        for cid, name, total_cents in rows:
            percent = 0.0 if total == 0 else float(total_cents) / float(total)
            items.append(
                CategoryBreakdownItem(
                    category_id=str(cid),
                    name=name,
                    total_cents=int(total_cents),
                    percent=float(percent),
                )
            )
        return CategoryAnalyticsResult(type=type.value, items=items)

    async def trends(
        self,
        *,
        workspace: Workspace,
        current_start: datetime,
        current_end: datetime,
        previous_start: datetime,
        previous_end: datetime,
    ) -> TrendsResult:
        cur_income, cur_expense, _ = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace.id, start_date=current_start, end_date=current_end
        )
        prev_income, prev_expense, _ = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace.id, start_date=previous_start, end_date=previous_end
        )
        income_growth = (
            0.0 if prev_income == 0 else float(cur_income - prev_income) / float(prev_income)
        )
        expense_growth = (
            0.0 if prev_expense == 0 else float(cur_expense - prev_expense) / float(prev_expense)
        )
        return TrendsResult(
            current_income_cents=int(cur_income),
            current_expense_cents=int(cur_expense),
            previous_income_cents=int(prev_income),
            previous_expense_cents=int(prev_expense),
            income_growth_rate=float(income_growth),
            expense_growth_rate=float(expense_growth),
        )
