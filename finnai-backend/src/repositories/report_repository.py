from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.transaction import Transaction


class ReportRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_transactions_for_export(
        self,
        *,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
        type: str | None,
        category_id: uuid.UUID | None,
        account_id: uuid.UUID | None,
        amount_min_cents: int | None,
        amount_max_cents: int | None,
        search: str | None,
        limit: int,
        offset: int,
    ) -> list[Transaction]:
        stmt = select(Transaction).where(Transaction.workspace_id == workspace_id)
        stmt = stmt.where(Transaction.transaction_date >= start_date).where(
            Transaction.transaction_date <= end_date
        )
        if type is not None:
            stmt = stmt.where(Transaction.type == type)
        if category_id is not None:
            stmt = stmt.where(Transaction.category_id == category_id)
        if account_id is not None:
            stmt = stmt.where(Transaction.account_id == account_id)
        if amount_min_cents is not None:
            stmt = stmt.where(Transaction.amount_cents >= amount_min_cents)
        if amount_max_cents is not None:
            stmt = stmt.where(Transaction.amount_cents <= amount_max_cents)
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(Transaction.description.ilike(like), Transaction.notes.ilike(like))
            )

        stmt = stmt.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        stmt = stmt.options(selectinload(Transaction.account), selectinload(Transaction.category))
        stmt = stmt.limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
