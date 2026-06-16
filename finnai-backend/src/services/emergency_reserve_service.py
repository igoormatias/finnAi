from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Literal

from core.dates import current_month_range_utc, get_zoneinfo, previous_month_range_utc
from domain.goals import GoalStatus, GoalType
from models.workspace import Workspace
from models.workspace_goal import WorkspaceGoal
from repositories.analytics_repository import AnalyticsRepository
from repositories.financial_preferences_repository import FinancialPreferencesRepository
from repositories.goal_repository import GoalRepository

CoverageBasis = Literal["avg_3m", "current_month", "goal_implied"]


@dataclass(frozen=True)
class EmergencyReserveResult:
    reserved_cents: int
    avg_monthly_expense_cents: int
    target_cents: int
    target_months: int
    coverage_months: float | None
    coverage_basis: CoverageBasis | None
    has_emergency_goal: bool
    goal_id: str | None


@dataclass(frozen=True)
class MonthlyExpensePoint:
    month: str
    expense_cents: int
    income_cents: int
    vs_previous_percent: float | None


class EmergencyReserveService:
    def __init__(self, session) -> None:
        self._session = session
        self._analytics = AnalyticsRepository(session)
        self._goals = GoalRepository(session)
        self._prefs = FinancialPreferencesRepository(session)

    async def get_reserve(self, *, workspace: Workspace) -> EmergencyReserveResult:
        tz = workspace.timezone or "UTC"
        prefs = await self._prefs.get_by_workspace(workspace.id)
        target_months = prefs.emergency_reserve_target_months if prefs else 6

        emergency_goal = await self._find_emergency_goal(workspace.id)
        reserved = int(emergency_goal.current_amount_cents) if emergency_goal else 0

        avg_3m = await self._avg_last_n_complete_months(workspace_id=workspace.id, tz=tz, n=3)
        denominator, coverage_basis = await self._resolve_expense_denominator(
            workspace_id=workspace.id,
            tz=tz,
            avg_3m=avg_3m,
            emergency_goal=emergency_goal,
            target_months=target_months,
        )

        config_target = int(target_months * avg_3m)
        meta_target = int(emergency_goal.target_amount_cents) if emergency_goal else 0
        target_cents = max(config_target, meta_target)

        coverage_months: float | None = None
        if denominator > 0 and reserved > 0:
            coverage_months = round(float(reserved) / float(denominator), 1)

        return EmergencyReserveResult(
            reserved_cents=reserved,
            avg_monthly_expense_cents=denominator,
            target_cents=target_cents,
            target_months=target_months,
            coverage_months=coverage_months,
            coverage_basis=coverage_basis,
            has_emergency_goal=emergency_goal is not None,
            goal_id=str(emergency_goal.id) if emergency_goal else None,
        )

    async def monthly_expenses(self, *, workspace: Workspace, months: int = 12) -> list[MonthlyExpensePoint]:
        tz = workspace.timezone or "UTC"
        now = datetime.now(timezone.utc)
        zone = get_zoneinfo(tz)
        local_now = now.astimezone(zone)

        points: list[MonthlyExpensePoint] = []
        prev_expense: int | None = None

        for offset in range(months - 1, -1, -1):
            month_start_local = _subtract_months(
                datetime(local_now.year, local_now.month, 1, tzinfo=zone), offset
            )
            if offset == 0:
                month_end_local = local_now
            else:
                next_month = _add_months(month_start_local, 1)
                month_end_local = next_month - timedelta(microseconds=1)

            start_utc = month_start_local.astimezone(timezone.utc)
            end_utc = month_end_local.astimezone(timezone.utc)
            income, expense, _ = await self._analytics.monthly_income_expense_and_count(
                workspace_id=workspace.id, start_date=start_utc, end_date=end_utc
            )
            vs_prev = None
            if prev_expense is not None and prev_expense > 0:
                vs_prev = round((float(expense) - float(prev_expense)) / float(prev_expense) * 100, 1)
            points.append(
                MonthlyExpensePoint(
                    month=month_start_local.strftime("%Y-%m"),
                    expense_cents=int(expense),
                    income_cents=int(income),
                    vs_previous_percent=vs_prev,
                )
            )
            prev_expense = int(expense)

        return points

    async def _avg_last_n_complete_months(
        self, *, workspace_id: uuid.UUID, tz: str, n: int
    ) -> int:
        now = datetime.now(timezone.utc)
        expenses: list[int] = []
        cursor = now
        for _ in range(n):
            prev = previous_month_range_utc(now_utc=cursor, tz=tz)
            _, expense, _ = await self._analytics.monthly_income_expense_and_count(
                workspace_id=workspace_id, start_date=prev.start, end_date=prev.end
            )
            expenses.append(int(expense))
            cursor = prev.start
        if not expenses:
            return 0
        return int(sum(expenses) / len(expenses))

    async def _current_month_expense(self, *, workspace_id: uuid.UUID, tz: str) -> int:
        now = datetime.now(timezone.utc)
        month_range = current_month_range_utc(now_utc=now, tz=tz)
        _, expense, _ = await self._analytics.monthly_income_expense_and_count(
            workspace_id=workspace_id, start_date=month_range.start, end_date=month_range.end
        )
        return int(expense)

    async def _resolve_expense_denominator(
        self,
        *,
        workspace_id: uuid.UUID,
        tz: str,
        avg_3m: int,
        emergency_goal: WorkspaceGoal | None,
        target_months: int,
    ) -> tuple[int, CoverageBasis | None]:
        # v1: all expense transactions count as essential until category tagging exists.
        if avg_3m > 0:
            return avg_3m, "avg_3m"

        current_month = await self._current_month_expense(workspace_id=workspace_id, tz=tz)
        if current_month > 0:
            return current_month, "current_month"

        if emergency_goal is not None and target_months > 0 and emergency_goal.target_amount_cents > 0:
            implied = int(emergency_goal.target_amount_cents / target_months)
            if implied > 0:
                return implied, "goal_implied"

        return 0, None

    async def _find_emergency_goal(self, workspace_id: uuid.UUID) -> WorkspaceGoal | None:
        goals = await self._goals.list_by_workspace(workspace_id)
        for goal in goals:
            if (
                goal.goal_type == GoalType.emergency_reserve.value
                and goal.status == GoalStatus.active.value
            ):
                return goal
        return None


def _subtract_months(dt: datetime, months: int) -> datetime:
    year = dt.year
    month = dt.month - months
    while month <= 0:
        month += 12
        year -= 1
    return datetime(year, month, 1, tzinfo=dt.tzinfo)


def _add_months(dt: datetime, months: int) -> datetime:
    year = dt.year
    month = dt.month + months
    while month > 12:
        month -= 12
        year += 1
    return datetime(year, month, 1, tzinfo=dt.tzinfo)
