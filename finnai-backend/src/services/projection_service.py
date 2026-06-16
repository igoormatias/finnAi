from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.dates import DateRange, get_zoneinfo, iter_period_starts_utc, normalize_range_to_utc
from domain.date_presets import ReportMode, resolve_period
from domain.goals import GoalStatus
from models.transaction import Transaction
from models.workspace import Workspace
from models.workspace_financial_preferences import WorkspaceFinancialPreferences
from repositories.analytics_repository import AnalyticsRepository
from repositories.financial_preferences_repository import FinancialPreferencesRepository
from repositories.goal_repository import GoalRepository
from repositories.transaction_repository import TransactionRepository

MAX_RECURRENCE_OCCURRENCES = 365


@dataclass(frozen=True)
class ProjectedCashflowPoint:
    bucket_start: datetime
    income_cents: int
    expense_cents: int
    cumulative_balance_cents: int
    is_projected: bool


@dataclass(frozen=True)
class ProjectedCashflowResult:
    granularity: str
    points: list[ProjectedCashflowPoint]
    projected_income_cents: int
    projected_expense_cents: int
    projected_balance_delta_cents: int


@dataclass(frozen=True)
class SyntheticEvent:
    at: datetime
    type: str
    amount_cents: int
    is_projected: bool


class ProjectionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._transactions = TransactionRepository(session)
        self._goals = GoalRepository(session)
        self._prefs_repo = FinancialPreferencesRepository(session)
        self._analytics = AnalyticsRepository(session)

    async def projected_cashflow(
        self,
        *,
        workspace: Workspace,
        start_date: datetime,
        end_date: datetime,
        granularity: str,
        mode: ReportMode = "projected",
    ) -> ProjectedCashflowResult:
        prefs = await self._get_prefs(workspace)
        tz = workspace.timezone or "UTC"
        dr = normalize_range_to_utc(start=start_date, end=end_date, tz=tz)
        now = datetime.now(timezone.utc)

        events: list[SyntheticEvent] = []

        if mode in ("historical", "complete") and prefs.include_past_transactions:
            events.extend(
                await self._real_events(
                    workspace_id=workspace.id,
                    start=dr.start,
                    end=min(dr.end, now),
                    is_projected=False,
                )
            )

        if mode in ("projected", "complete"):
            if prefs.include_future_transactions:
                future_start = max(dr.start, now)
                if future_start <= dr.end:
                    events.extend(
                        await self._real_events(
                            workspace_id=workspace.id,
                            start=future_start,
                            end=dr.end,
                            is_projected=True,
                        )
                    )
            if prefs.include_recurrences_in_projections:
                events.extend(
                    await self._recurrence_events(
                        workspace_id=workspace.id,
                        start=dr.start,
                        end=dr.end,
                        now=now,
                        tz=tz,
                    )
                )
            if prefs.include_goals_in_projections:
                events.extend(await self._goal_events(workspace_id=workspace.id, start=dr.start, end=dr.end))

        if mode == "historical":
            events = [e for e in events if not e.is_projected]

        points = self._bucket_events(events=events, granularity=granularity, tz=tz, dr=dr)
        projected_income = sum(e.amount_cents for e in events if e.type == "income" and e.is_projected)
        projected_expense = sum(e.amount_cents for e in events if e.type == "expense" and e.is_projected)

        return ProjectedCashflowResult(
            granularity=granularity,
            points=points,
            projected_income_cents=int(projected_income),
            projected_expense_cents=int(projected_expense),
            projected_balance_delta_cents=int(projected_income - projected_expense),
        )

    async def projected_30d_summary(self, *, workspace: Workspace) -> dict:
        tz = workspace.timezone or "UTC"
        period = resolve_period(preset="next_30_days", tz=tz)
        result = await self.projected_cashflow(
            workspace=workspace,
            start_date=period.start,
            end_date=period.end,
            granularity="daily",
            mode="projected",
        )
        return {
            "income_cents": result.projected_income_cents,
            "expense_cents": result.projected_expense_cents,
            "balance_delta_cents": result.projected_balance_delta_cents,
        }

    async def recurring_monthly_burn_cents(self, *, workspace_id: uuid.UUID) -> int:
        stmt = select(Transaction).where(
            Transaction.workspace_id == workspace_id,
            Transaction.is_recurring.is_(True),
            Transaction.type == "expense",
        )
        result = await self._session.execute(stmt)
        total = 0
        for tx in result.scalars().all():
            rule = tx.recurrence_rule or "monthly"
            if rule == "weekly":
                total += int(tx.amount_cents) * 4
            elif rule == "yearly":
                total += int(tx.amount_cents) // 12
            else:
                total += int(tx.amount_cents)
        return total

    async def _get_prefs(self, workspace: Workspace) -> WorkspaceFinancialPreferences:
        prefs = await self._prefs_repo.get_by_workspace(workspace.id)
        if prefs is not None:
            return prefs
        return WorkspaceFinancialPreferences(workspace_id=workspace.id)

    async def _real_events(
        self,
        *,
        workspace_id: uuid.UUID,
        start: datetime,
        end: datetime,
        is_projected: bool,
    ) -> list[SyntheticEvent]:
        stmt = select(Transaction).where(
            Transaction.workspace_id == workspace_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        result = await self._session.execute(stmt)
        return [
            SyntheticEvent(
                at=tx.transaction_date,
                type=tx.type,
                amount_cents=int(tx.amount_cents),
                is_projected=is_projected,
            )
            for tx in result.scalars().all()
        ]

    async def _recurrence_events(
        self,
        *,
        workspace_id: uuid.UUID,
        start: datetime,
        end: datetime,
        now: datetime,
        tz: str,
    ) -> list[SyntheticEvent]:
        stmt = select(Transaction).where(
            Transaction.workspace_id == workspace_id,
            Transaction.is_recurring.is_(True),
        )
        result = await self._session.execute(stmt)
        events: list[SyntheticEvent] = []
        for tx in result.scalars().all():
            rule = tx.recurrence_rule or "monthly"
            anchor = tx.transaction_date
            if anchor.tzinfo is None:
                anchor = anchor.replace(tzinfo=timezone.utc)
            cursor = anchor
            count = 0
            while cursor <= end and count < MAX_RECURRENCE_OCCURRENCES:
                if cursor >= start:
                    is_future = cursor > now
                    if not self._has_real_match(workspace_id, tx, cursor):
                        events.append(
                            SyntheticEvent(
                                at=cursor,
                                type=tx.type,
                                amount_cents=int(tx.amount_cents),
                                is_projected=is_future or cursor > now,
                            )
                        )
                cursor = _add_recurrence(cursor, rule, tz)
                count += 1
        return events

    async def _has_real_match(
        self, workspace_id: uuid.UUID, anchor: Transaction, at: datetime
    ) -> bool:
        day_start = at.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1) - timedelta(microseconds=1)
        stmt = select(Transaction.id).where(
            Transaction.workspace_id == workspace_id,
            Transaction.category_id == anchor.category_id,
            Transaction.amount_cents == anchor.amount_cents,
            Transaction.type == anchor.type,
            Transaction.transaction_date >= day_start,
            Transaction.transaction_date <= day_end,
            Transaction.is_recurring.is_(False),
        )
        result = await self._session.execute(stmt.limit(1))
        return result.scalar_one_or_none() is not None

    async def _goal_events(
        self, *, workspace_id: uuid.UUID, start: datetime, end: datetime
    ) -> list[SyntheticEvent]:
        goals = await self._goals.list_by_workspace(workspace_id)
        events: list[SyntheticEvent] = []
        for goal in goals:
            if goal.status != GoalStatus.active.value:
                continue
            monthly = _monthly_goal_projection(goal)
            if monthly is None or monthly <= 0:
                continue
            zone = timezone.utc
            cursor = datetime(start.year, start.month, 1, tzinfo=zone)
            while cursor <= end:
                if cursor >= start:
                    events.append(
                        SyntheticEvent(
                            at=cursor,
                            type="expense",
                            amount_cents=monthly,
                            is_projected=True,
                        )
                    )
                cursor = _add_month(cursor)
        return events

    def _bucket_events(
        self,
        *,
        events: list[SyntheticEvent],
        granularity: str,
        tz: str,
        dr: DateRange,
    ) -> list[ProjectedCashflowPoint]:
        buckets = iter_period_starts_utc(
            start_utc=dr.start, end_utc=dr.end, granularity=granularity, tz=tz
        )
        points: list[ProjectedCashflowPoint] = []
        cumulative = 0
        for i, bucket_start in enumerate(buckets):
            bucket_end = buckets[i + 1] if i + 1 < len(buckets) else dr.end
            income = sum(
                e.amount_cents
                for e in events
                if e.type == "income" and bucket_start <= e.at < bucket_end
            )
            expense = sum(
                e.amount_cents
                for e in events
                if e.type == "expense" and bucket_start <= e.at < bucket_end
            )
            is_projected = any(
                e.is_projected for e in events if bucket_start <= e.at < bucket_end
            )
            cumulative += income - expense
            points.append(
                ProjectedCashflowPoint(
                    bucket_start=bucket_start,
                    income_cents=int(income),
                    expense_cents=int(expense),
                    cumulative_balance_cents=int(cumulative),
                    is_projected=is_projected,
                )
            )
        return points


def _monthly_goal_projection(goal) -> int | None:
    if not goal.target_date or goal.status != GoalStatus.active.value:
        return None
    target: date = goal.target_date
    now = datetime.now(timezone.utc).date()
    months = (target.year - now.year) * 12 + (target.month - now.month)
    if months <= 0:
        return None
    remaining = max(0, int(goal.target_amount_cents) - int(goal.current_amount_cents))
    if remaining == 0:
        return None
    return (remaining + months - 1) // months


def _add_month(dt: datetime) -> datetime:
    year = dt.year + (1 if dt.month == 12 else 0)
    month = 1 if dt.month == 12 else dt.month + 1
    return datetime(year, month, 1, tzinfo=dt.tzinfo)


def _add_recurrence(dt: datetime, rule: str, tz: str) -> datetime:
    zone = get_zoneinfo(tz)
    local = dt.astimezone(zone)
    if rule == "weekly":
        nxt = local + timedelta(days=7)
    elif rule == "yearly":
        nxt = datetime(local.year + 1, local.month, local.day, tzinfo=zone)
    else:
        nxt = _add_month(local)
    return nxt.astimezone(timezone.utc)
