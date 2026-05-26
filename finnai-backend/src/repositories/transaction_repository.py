from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.transaction import Transaction


class TransactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        account_id: uuid.UUID,
        category_id: uuid.UUID,
        created_by: uuid.UUID,
        type: str,
        amount_cents: int,
        description: str,
        notes: str | None,
        transaction_date: datetime,
        is_recurring: bool,
        recurrence_rule: str | None,
    ) -> Transaction:
        tx = Transaction(
            workspace_id=workspace_id,
            account_id=account_id,
            category_id=category_id,
            created_by=created_by,
            type=type,
            amount_cents=amount_cents,
            description=description,
            notes=notes,
            transaction_date=transaction_date,
            is_recurring=is_recurring,
            recurrence_rule=recurrence_rule,
        )
        self._session.add(tx)
        await self._session.flush()
        await self._session.refresh(tx)
        return tx

    async def get_by_id(self, transaction_id: uuid.UUID) -> Transaction | None:
        result = await self._session.execute(
            select(Transaction)
            .where(Transaction.id == transaction_id)
            .options(selectinload(Transaction.account), selectinload(Transaction.category))
        )
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self,
        *,
        workspace_id: uuid.UUID,
        limit: int,
        offset: int,
        sort: str,
        type: str | None,
        category_id: uuid.UUID | None,
        account_id: uuid.UUID | None,
        start_date: datetime | None,
        end_date: datetime | None,
        amount_min_cents: int | None,
        amount_max_cents: int | None,
        recurring: bool | None,
        search: str | None,
    ) -> tuple[int, list[Transaction]]:
        stmt = select(Transaction).where(Transaction.workspace_id == workspace_id)

        if type is not None:
            stmt = stmt.where(Transaction.type == type)
        if category_id is not None:
            stmt = stmt.where(Transaction.category_id == category_id)
        if account_id is not None:
            stmt = stmt.where(Transaction.account_id == account_id)
        if start_date is not None:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date is not None:
            stmt = stmt.where(Transaction.transaction_date <= end_date)
        if amount_min_cents is not None:
            stmt = stmt.where(Transaction.amount_cents >= amount_min_cents)
        if amount_max_cents is not None:
            stmt = stmt.where(Transaction.amount_cents <= amount_max_cents)
        if recurring is not None:
            stmt = stmt.where(Transaction.is_recurring.is_(recurring))
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Transaction.description.ilike(like),
                    Transaction.notes.ilike(like),
                )
            )

        stmt = self._apply_sort(stmt, sort)
        total = await self._count(stmt)

        result = await self._session.execute(
            stmt.options(selectinload(Transaction.account), selectinload(Transaction.category))
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        return total, items

    async def update(
        self,
        tx: Transaction,
        *,
        account_id: uuid.UUID | None,
        category_id: uuid.UUID | None,
        type: str | None,
        amount_cents: int | None,
        description: str | None,
        notes: str | None,
        transaction_date: datetime | None,
        is_recurring: bool | None,
        recurrence_rule: str | None,
    ) -> Transaction:
        if account_id is not None:
            tx.account_id = account_id
        if category_id is not None:
            tx.category_id = category_id
        if type is not None:
            tx.type = type
        if amount_cents is not None:
            tx.amount_cents = amount_cents
        if description is not None:
            tx.description = description
        if notes is not None:
            tx.notes = notes
        if transaction_date is not None:
            tx.transaction_date = transaction_date
        if is_recurring is not None:
            tx.is_recurring = is_recurring
        if recurrence_rule is not None or is_recurring is not None:
            tx.recurrence_rule = recurrence_rule
        await self._session.flush()
        await self._session.refresh(tx)
        return tx

    async def delete(self, tx: Transaction) -> None:
        await self._session.delete(tx)
        await self._session.flush()

    async def sum_amounts_by_type_in_range(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        type: str,
    ) -> int:
        stmt = (
            select(func.coalesce(func.sum(Transaction.amount_cents), 0))
            .where(Transaction.workspace_id == workspace_id)
            .where(Transaction.type == type)
            .where(Transaction.transaction_date >= start_date)
            .where(Transaction.transaction_date <= end_date)
        )
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    def _apply_sort(
        self, stmt: Select[tuple[Transaction]], sort: str
    ) -> Select[tuple[Transaction]]:
        if sort == "oldest":
            return stmt.order_by(Transaction.transaction_date.asc(), Transaction.created_at.asc())
        if sort == "amount_asc":
            return stmt.order_by(
                Transaction.amount_cents.asc(), Transaction.transaction_date.desc()
            )
        if sort == "amount_desc":
            return stmt.order_by(
                Transaction.amount_cents.desc(), Transaction.transaction_date.desc()
            )
        return stmt.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())

    async def _count(self, stmt: Select[tuple[Transaction]]) -> int:
        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        result = await self._session.execute(count_stmt)
        return int(result.scalar_one())
