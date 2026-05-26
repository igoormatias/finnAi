from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from core.cache.base import AnalyticsCache
from core.dates import current_month_range_utc
from models.workspace import Workspace
from repositories.analytics_repository import AnalyticsRepository


@dataclass(frozen=True)
class BiggestTransaction:
    id: str
    amount_cents: int
    description: str


@dataclass(frozen=True)
class DashboardOverview:
    total_balance_cents: int
    monthly_income_cents: int
    monthly_expense_cents: int
    savings_cents: int
    savings_rate: float
    transaction_count: int
    biggest_expense: BiggestTransaction | None
    biggest_income: BiggestTransaction | None


class DashboardService:
    def __init__(self, session: AsyncSession, cache: AnalyticsCache) -> None:
        self._session = session
        self._cache = cache
        self._analytics = AnalyticsRepository(session)

    async def overview(self, *, workspace: Workspace) -> DashboardOverview:
        tz = workspace.timezone or "UTC"
        month_range = current_month_range_utc(tz=tz)

        total_balance = await self._analytics.total_balance_cents(workspace_id=workspace.id)
        income, expense, count = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace.id,
            start_date=month_range.start,
            end_date=month_range.end,
        )
        savings = int(income) - int(expense)
        savings_rate = 0.0 if income == 0 else float(savings) / float(income)

        biggest_income = await self._analytics.biggest_transaction(
            workspace_id=workspace.id,
            start_date=month_range.start,
            end_date=month_range.end,
            type="income",
        )
        biggest_expense = await self._analytics.biggest_transaction(
            workspace_id=workspace.id,
            start_date=month_range.start,
            end_date=month_range.end,
            type="expense",
        )

        return DashboardOverview(
            total_balance_cents=int(total_balance),
            monthly_income_cents=int(income),
            monthly_expense_cents=int(expense),
            savings_cents=int(savings),
            savings_rate=float(savings_rate),
            transaction_count=int(count),
            biggest_expense=(
                None
                if biggest_expense is None
                else BiggestTransaction(
                    id=str(biggest_expense[0]),
                    amount_cents=int(biggest_expense[1]),
                    description=str(biggest_expense[2]),
                )
            ),
            biggest_income=(
                None
                if biggest_income is None
                else BiggestTransaction(
                    id=str(biggest_income[0]),
                    amount_cents=int(biggest_income[1]),
                    description=str(biggest_income[2]),
                )
            ),
        )

    async def accounts(self, *, workspace: Workspace) -> list[dict]:
        tz = workspace.timezone or "UTC"
        month_range = current_month_range_utc(tz=tz)
        balances = await self._analytics.accounts_balances(workspace_id=workspace.id)
        movement = await self._analytics.accounts_movement(
            workspace_id=workspace.id,
            start_date=month_range.start,
            end_date=month_range.end,
        )
        movement_map = {aid: (inc, exp) for aid, inc, exp in movement}

        items = []
        for aid, name, type_, balance in balances:
            inc, exp = movement_map.get(aid, (0, 0))
            items.append(
                {
                    "account_id": str(aid),
                    "name": name,
                    "type": type_,
                    "current_balance_cents": int(balance),
                    "monthly_income_cents": int(inc),
                    "monthly_expense_cents": int(exp),
                }
            )
        return items
