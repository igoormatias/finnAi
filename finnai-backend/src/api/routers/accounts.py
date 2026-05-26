from __future__ import annotations

import uuid

from fastapi import APIRouter

from api.deps import DbSessionDep
from api.deps_finance import FinanceWriteDep
from api.deps_workspaces import WorkspaceMemberDep
from domain.finance import AccountType
from schemas.finance import AccountCreate, AccountResponse, AccountUpdate
from services.account_service import AccountService

router = APIRouter(prefix="/workspaces/{slug}/accounts", tags=["accounts"])


@router.post("", response_model=AccountResponse, status_code=201)
async def create_account(
    body: AccountCreate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> AccountResponse:
    account = await AccountService(session).create_account(
        workspace=context.workspace,
        name=body.name,
        type=AccountType(body.type),
        initial_balance_cents=body.initial_balance_cents,
    )
    return AccountResponse.model_validate(account)


@router.get("", response_model=list[AccountResponse])
async def list_accounts(
    context: WorkspaceMemberDep, session: DbSessionDep
) -> list[AccountResponse]:
    accounts = await AccountService(session).list_accounts(context.workspace)
    return [AccountResponse.model_validate(item) for item in accounts]


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: uuid.UUID,
    context: WorkspaceMemberDep,
    session: DbSessionDep,
) -> AccountResponse:
    account = await AccountService(session).get_account(
        workspace=context.workspace, account_id=account_id
    )
    return AccountResponse.model_validate(account)


@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: uuid.UUID,
    body: AccountUpdate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> AccountResponse:
    account = await AccountService(session).update_account(
        workspace=context.workspace,
        account_id=account_id,
        name=body.name,
        type=AccountType(body.type) if body.type is not None else None,
    )
    return AccountResponse.model_validate(account)


@router.delete("/{account_id}", status_code=204)
async def delete_account(
    account_id: uuid.UUID,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> None:
    await AccountService(session).delete_account(workspace=context.workspace, account_id=account_id)
