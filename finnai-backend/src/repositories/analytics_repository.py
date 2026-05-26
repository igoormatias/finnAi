from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account
from models.category import Category
from models.transaction import Transaction


class AnalyticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def total_balance_cents(self, *, workspace_id: uuid.UUID) -> int:
        stmt = select(func.coalesce(func.sum(Account.current_balance_cents), 0)).where(
            Account.workspace_id == workspace_id
        )
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    async def monthly_income_expense_and_count(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> tuple[int, int, int]:
        income_sum = func.coalesce(
            func.sum(case((Transaction.type == "income", Transaction.amount_cents), else_=0)),
            0,
        )
        expense_sum = func.coalesce(
            func.sum(case((Transaction.type == "expense", Transaction.amount_cents), else_=0)),
            0,
        )
        tx_count = func.count(Transaction.id)
        stmt = (
            select(income_sum, expense_sum, tx_count)
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
        )
        result = await self._session.execute(stmt)
        row = result.one()
        return int(row[0]), int(row[1]), int(row[2])

    async def biggest_transaction(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        type: str,
    ) -> tuple[uuid.UUID, int, str] | None:
        stmt = (
            select(Transaction.id, Transaction.amount_cents, Transaction.description)
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.type == type)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
            .order_by(Transaction.amount_cents.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        row = result.one_or_none()
        if row is None:
            return None
        return uuid.UUID(str(row[0])), int(row[1]), str(row[2] or "")

    async def categories_breakdown(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        type: str,
    ) -> list[tuple[uuid.UUID, str, int]]:
        stmt = (
            select(
                Category.id,
                Category.name,
                func.coalesce(func.sum(Transaction.amount_cents), 0).label("total_cents"),
            )
            .join(Category, Category.id == Transaction.category_id)
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.type == type)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(Transaction.amount_cents).desc())
        )
        result = await self._session.execute(stmt)
        rows = []
        for cid, name, total in result.all():
            rows.append((uuid.UUID(str(cid)), str(name), int(total)))
        return rows

    async def accounts_balances(
        self,
        *,
        workspace_id: uuid.UUID,
    ) -> list[tuple[uuid.UUID, str, str, int]]:
        stmt = (
            select(Account.id, Account.name, Account.type, Account.current_balance_cents)
            .where(Account.workspace_id == workspace_id)
            .order_by(Account.current_balance_cents.desc())
        )
        result = await self._session.execute(stmt)
        return [
            (uuid.UUID(str(aid)), str(name), str(type_), int(balance))
            for aid, name, type_, balance in result.all()
        ]

    async def accounts_movement(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> list[tuple[uuid.UUID, int, int]]:
        inflow = func.coalesce(
            func.sum(case((Transaction.type == "income", Transaction.amount_cents), else_=0)),
            0,
        )
        outflow = func.coalesce(
            func.sum(case((Transaction.type == "expense", Transaction.amount_cents), else_=0)),
            0,
        )
        stmt = (
            select(Transaction.account_id, inflow, outflow)
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
            .group_by(Transaction.account_id)
        )
        result = await self._session.execute(stmt)
        return [(uuid.UUID(str(aid)), int(inc), int(exp)) for aid, inc, exp in result.all()]

    async def cashflow_series(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        granularity: str,
        tz: str,
    ) -> list[tuple[datetime, int, int]]:
        if granularity not in {"daily", "weekly", "monthly", "yearly"}:
            raise ValueError("Invalid granularity")

        # Use UTC bucketing; tz-specific buckets are handled at service layer by building bucket boundaries.
        # Here we aggregate by trunc in UTC to keep portable across sqlite/postgres tests.
        if granularity == "daily":
            bucket = func.date(Transaction.transaction_date)
        elif granularity == "weekly":
            bucket = func.strftime("%Y-%W", Transaction.transaction_date)
        elif granularity == "monthly":
            bucket = func.strftime("%Y-%m", Transaction.transaction_date)
        else:
            bucket = func.strftime("%Y", Transaction.transaction_date)

        income_sum = func.coalesce(
            func.sum(case((Transaction.type == "income", Transaction.amount_cents), else_=0)),
            0,
        )
        expense_sum = func.coalesce(
            func.sum(case((Transaction.type == "expense", Transaction.amount_cents), else_=0)),
            0,
        )
        stmt = (
            select(bucket.label("bucket"), income_sum, expense_sum)
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
            .group_by("bucket")
            .order_by("bucket")
        )
        result = await self._session.execute(stmt)
        rows: list[tuple[datetime, int, int]] = []
        for b, inc, exp in result.all():
            # Represent bucket as datetime start in UTC (best-effort for sqlite string buckets)
            if isinstance(b, str):
                if granularity == "weekly":
                    year, week = b.split("-", 1)
                    dt = datetime.fromisocalendar(int(year), int(week) + 1, 1).replace(tzinfo=UTC)
                elif granularity == "monthly":
                    dt = datetime(int(b[0:4]), int(b[5:7]), 1, tzinfo=UTC)
                elif granularity == "yearly":
                    dt = datetime(int(b), 1, 1, tzinfo=UTC)
                else:
                    dt = datetime.fromisoformat(b).replace(tzinfo=UTC)
            else:
                dt = datetime.fromisoformat(str(b)).replace(tzinfo=UTC)
            rows.append((dt, int(inc), int(exp)))
        return rows
