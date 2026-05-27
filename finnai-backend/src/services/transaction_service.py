from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from domain.exceptions import (
    AccountNotFoundException,
    CategoryNotFoundException,
    ForbiddenException,
    TransactionNotFoundException,
)
from domain.finance import CategoryType, RecurrenceRule, TransactionType
from domain.workspace_roles import WorkspaceRole
from models.account import Account
from models.category import Category
from models.transaction import Transaction
from models.user import User
from models.workspace import Workspace
from models.workspace_membership import WorkspaceMembership
from repositories.account_repository import AccountRepository
from repositories.category_repository import CategoryRepository
from repositories.transaction_repository import TransactionRepository


class TransactionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._accounts = AccountRepository(session)
        self._categories = CategoryRepository(session)
        self._transactions = TransactionRepository(session)

    async def create_transaction(
        self,
        *,
        workspace: Workspace,
        actor: User,
        account_id: uuid.UUID,
        category_id: uuid.UUID,
        type: TransactionType,
        amount_cents: int,
        description: str,
        notes: str | None,
        transaction_date: datetime,
        is_recurring: bool,
        recurrence_rule: RecurrenceRule | None,
    ) -> Transaction:
        if amount_cents <= 0:
            raise ForbiddenException("amount_cents must be > 0")

        async with self._session.begin_nested():
            account = await self._get_account_for_update(workspace.id, account_id)
            category = await self._get_category(workspace.id, category_id)
            self._assert_category_matches_type(category, type)
            self._assert_recurrence_fields(is_recurring, recurrence_rule)

            tx = await self._transactions.create(
                workspace_id=workspace.id,
                account_id=account.id,
                category_id=category.id,
                created_by=actor.id,
                type=type.value,
                amount_cents=int(amount_cents),
                description=description,
                notes=notes,
                transaction_date=transaction_date,
                is_recurring=is_recurring,
                recurrence_rule=recurrence_rule.value if recurrence_rule is not None else None,
            )

            self._apply_delta(account, self._delta(type, amount_cents))
            await self._session.flush()
            await self._session.refresh(tx)

        await self._session.commit()
        return tx

    async def get_transaction(
        self, *, workspace: Workspace, transaction_id: uuid.UUID
    ) -> Transaction:
        tx = await self._transactions.get_by_id(transaction_id)
        if tx is None or tx.workspace_id != workspace.id:
            raise TransactionNotFoundException("Transaction not found")
        return tx

    async def list_transactions(
        self,
        *,
        workspace: Workspace,
        limit: int,
        offset: int,
        sort: str,
        type: TransactionType | None,
        category_id: uuid.UUID | None,
        account_id: uuid.UUID | None,
        start_date: datetime | None,
        end_date: datetime | None,
        amount_min_cents: int | None,
        amount_max_cents: int | None,
        recurring: bool | None,
        search: str | None,
    ) -> tuple[int, list[Transaction]]:
        return await self._transactions.list_by_workspace(
            workspace_id=workspace.id,
            limit=limit,
            offset=offset,
            sort=sort,
            type=type.value if type is not None else None,
            category_id=category_id,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date,
            amount_min_cents=amount_min_cents,
            amount_max_cents=amount_max_cents,
            recurring=recurring,
            search=search,
        )

    async def update_transaction(
        self,
        *,
        workspace: Workspace,
        actor: User,
        transaction_id: uuid.UUID,
        account_id: uuid.UUID | None,
        category_id: uuid.UUID | None,
        type: TransactionType | None,
        amount_cents: int | None,
        description: str | None,
        notes: str | None,
        transaction_date: datetime | None,
        is_recurring: bool | None,
        recurrence_rule: RecurrenceRule | None,
    ) -> Transaction:
        if amount_cents is not None and amount_cents <= 0:
            raise ForbiddenException("amount_cents must be > 0")

        async with self._session.begin_nested():
            tx = await self._transactions.get_by_id(transaction_id)
            if tx is None or tx.workspace_id != workspace.id:
                raise TransactionNotFoundException("Transaction not found")

            old_type = TransactionType(tx.type)
            old_amount = int(tx.amount_cents)
            old_account_id = tx.account_id

            new_type = type or old_type
            new_amount = int(amount_cents) if amount_cents is not None else old_amount
            new_account_id = account_id or old_account_id

            if category_id is not None:
                category = await self._get_category(workspace.id, category_id)
                self._assert_category_matches_type(category, new_type)
            else:
                category = await self._get_category(workspace.id, tx.category_id)
                self._assert_category_matches_type(category, new_type)

            self._assert_recurrence_fields(
                is_recurring if is_recurring is not None else tx.is_recurring, recurrence_rule
            )

            if new_account_id == old_account_id:
                account = await self._get_account_for_update(workspace.id, old_account_id)
                self._apply_delta(account, -self._delta(old_type, old_amount))
                self._apply_delta(account, self._delta(new_type, new_amount))
            else:
                old_account = await self._get_account_for_update(workspace.id, old_account_id)
                new_account = await self._get_account_for_update(workspace.id, new_account_id)
                self._apply_delta(old_account, -self._delta(old_type, old_amount))
                self._apply_delta(new_account, self._delta(new_type, new_amount))

            updated = await self._transactions.update(
                tx,
                account_id=new_account_id if account_id is not None else None,
                category_id=category_id,
                type=new_type.value if type is not None else None,
                amount_cents=new_amount if amount_cents is not None else None,
                description=description,
                notes=notes,
                transaction_date=transaction_date,
                is_recurring=is_recurring,
                recurrence_rule=recurrence_rule.value if recurrence_rule is not None else None,
            )
            await self._session.flush()
            await self._session.refresh(updated)

        await self._session.commit()
        return updated

    async def delete_transaction(self, *, workspace: Workspace, transaction_id: uuid.UUID) -> None:
        async with self._session.begin_nested():
            tx = await self._transactions.get_by_id(transaction_id)
            if tx is None or tx.workspace_id != workspace.id:
                raise TransactionNotFoundException("Transaction not found")

            account = await self._get_account_for_update(workspace.id, tx.account_id)
            self._apply_delta(account, -self._delta(TransactionType(tx.type), int(tx.amount_cents)))
            await self._transactions.delete(tx)

        await self._session.commit()

    @staticmethod
    def assert_can_write(membership: WorkspaceMembership) -> None:
        if WorkspaceRole(membership.role) == WorkspaceRole.viewer:
            raise ForbiddenException("Viewer role is read-only")

    async def _get_account_for_update(
        self, workspace_id: uuid.UUID, account_id: uuid.UUID
    ) -> Account:
        account = await self._accounts.get_by_id_for_update(account_id)
        if account is None or account.workspace_id != workspace_id:
            raise AccountNotFoundException("Account not found")
        return account

    async def _get_category(self, workspace_id: uuid.UUID, category_id: uuid.UUID) -> Category:
        category = await self._categories.get_by_id(category_id)
        if category is None or category.workspace_id != workspace_id:
            raise CategoryNotFoundException("Category not found")
        return category

    @staticmethod
    def _assert_category_matches_type(category: Category, tx_type: TransactionType) -> None:
        if CategoryType(category.type) != CategoryType(tx_type.value):
            raise ForbiddenException("Transaction type must match category type")

    @staticmethod
    def _assert_recurrence_fields(
        is_recurring: bool, recurrence_rule: RecurrenceRule | None
    ) -> None:
        if is_recurring and recurrence_rule is None:
            raise ForbiddenException("recurrence_rule is required when is_recurring=true")
        if not is_recurring and recurrence_rule is not None:
            raise ForbiddenException("recurrence_rule must be null when is_recurring=false")

    @staticmethod
    def _delta(type: TransactionType, amount_cents: int) -> int:
        return int(amount_cents) if type == TransactionType.income else -int(amount_cents)

    @staticmethod
    def _apply_delta(account: Account, delta: int) -> None:
        account.current_balance_cents = int(account.current_balance_cents) + int(delta)
