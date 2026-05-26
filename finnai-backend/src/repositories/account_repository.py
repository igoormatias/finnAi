from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account


class AccountRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        name: str,
        type: str,
        initial_balance_cents: int,
        current_balance_cents: int,
    ) -> Account:
        account = Account(
            workspace_id=workspace_id,
            name=name,
            type=type,
            initial_balance_cents=initial_balance_cents,
            current_balance_cents=current_balance_cents,
        )
        self._session.add(account)
        await self._session.flush()
        await self._session.refresh(account)
        return account

    async def get_by_id(self, account_id: uuid.UUID) -> Account | None:
        result = await self._session.execute(select(Account).where(Account.id == account_id))
        return result.scalar_one_or_none()

    async def get_by_id_for_update(self, account_id: uuid.UUID) -> Account | None:
        stmt = select(Account).where(Account.id == account_id).with_for_update()
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[Account]:
        result = await self._session.execute(
            select(Account)
            .where(Account.workspace_id == workspace_id)
            .order_by(Account.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(
        self,
        account: Account,
        *,
        name: str | None,
        type: str | None,
    ) -> Account:
        if name is not None:
            account.name = name
        if type is not None:
            account.type = type
        await self._session.flush()
        await self._session.refresh(account)
        return account

    async def delete(self, account: Account) -> None:
        await self._session.delete(account)
        await self._session.flush()
