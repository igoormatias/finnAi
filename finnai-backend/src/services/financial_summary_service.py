from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.finance import TransactionType
from models.account import Account
from models.workspace import Workspace
from repositories.transaction_repository import TransactionRepository


@dataclass(frozen=True)
class DashboardSummary:
    total_balance_cents: int
    total_incomes_cents: int
    total_expenses_cents: int
    monthly_balance_cents: int
    savings_rate: float


class FinancialSummaryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._transactions = TransactionRepository(session)

    async def dashboard_summary(self, *, workspace: Workspace) -> DashboardSummary:
        total_balance = await self._total_balance(workspace.id)
        start, end = self._current_month_range()
        incomes = await self._transactions.sum_amounts_by_type_in_range(
            workspace_id=workspace.id,
            start_date=start,
            end_date=end,
            type=TransactionType.income.value,
        )
        expenses = await self._transactions.sum_amounts_by_type_in_range(
            workspace_id=workspace.id,
            start_date=start,
            end_date=end,
            type=TransactionType.expense.value,
        )
        monthly_balance = int(incomes) - int(expenses)
        savings_rate = 0.0 if incomes == 0 else float(monthly_balance) / float(incomes)
        return DashboardSummary(
            total_balance_cents=int(total_balance),
            total_incomes_cents=int(incomes),
            total_expenses_cents=int(expenses),
            monthly_balance_cents=int(monthly_balance),
            savings_rate=float(savings_rate),
        )

    async def _total_balance(self, workspace_id) -> int:
        stmt = select(func.coalesce(func.sum(Account.current_balance_cents), 0)).where(
            Account.workspace_id == workspace_id
        )
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    @staticmethod
    def _current_month_range() -> tuple[datetime, datetime]:
        now = datetime.now(timezone.utc)
        start = datetime(year=now.year, month=now.month, day=1, tzinfo=timezone.utc)
        return start, now
