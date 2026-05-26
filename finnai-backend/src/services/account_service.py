from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from domain.exceptions import AccountNotFoundException
from domain.finance import AccountType
from models.account import Account
from models.workspace import Workspace
from repositories.account_repository import AccountRepository


class AccountService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._accounts = AccountRepository(session)

    async def create_account(
        self,
        *,
        workspace: Workspace,
        name: str,
        type: AccountType,
        initial_balance_cents: int,
    ) -> Account:
        initial = int(initial_balance_cents)
        account = await self._accounts.create(
            workspace_id=workspace.id,
            name=name.strip(),
            type=type.value,
            initial_balance_cents=initial,
            current_balance_cents=initial,
        )
        await self._session.commit()
        return account

    async def list_accounts(self, workspace: Workspace) -> list[Account]:
        return await self._accounts.list_by_workspace(workspace.id)

    async def get_account(self, *, workspace: Workspace, account_id: uuid.UUID) -> Account:
        account = await self._accounts.get_by_id(account_id)
        if account is None or account.workspace_id != workspace.id:
            raise AccountNotFoundException("Account not found")
        return account

    async def update_account(
        self,
        *,
        workspace: Workspace,
        account_id: uuid.UUID,
        name: str | None,
        type: AccountType | None,
    ) -> Account:
        account = await self._accounts.get_by_id(account_id)
        if account is None or account.workspace_id != workspace.id:
            raise AccountNotFoundException("Account not found")

        updated = await self._accounts.update(
            account,
            name=name.strip() if name is not None else None,
            type=type.value if type is not None else None,
        )
        await self._session.commit()
        return updated

    async def delete_account(self, *, workspace: Workspace, account_id: uuid.UUID) -> None:
        account = await self._accounts.get_by_id(account_id)
        if account is None or account.workspace_id != workspace.id:
            raise AccountNotFoundException("Account not found")
        await self._accounts.delete(account)
        await self._session.commit()
