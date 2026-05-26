from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query

from api.deps import DbSessionDep
from api.deps_auth import CurrentUserDep
from api.deps_finance import FinanceWriteDep
from api.deps_workspaces import WorkspaceMemberDep
from domain.finance import RecurrenceRule, TransactionType
from schemas.finance import (
    PaginatedResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionSortLiteral,
    TransactionUpdate,
)
from services.transaction_service import TransactionService

router = APIRouter(prefix="/workspaces/{slug}/transactions", tags=["transactions"])


def _clamp_limit(limit: int) -> int:
    return min(max(limit, 1), 200)


@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    body: TransactionCreate,
    context: FinanceWriteDep,
    current_user: CurrentUserDep,
    session: DbSessionDep,
) -> TransactionResponse:
    tx = await TransactionService(session).create_transaction(
        workspace=context.workspace,
        actor=current_user,
        account_id=body.account_id,
        category_id=body.category_id,
        type=TransactionType(body.type),
        amount_cents=body.amount_cents,
        description=body.description,
        notes=body.notes,
        transaction_date=body.transaction_date,
        is_recurring=body.is_recurring,
        recurrence_rule=RecurrenceRule(body.recurrence_rule) if body.recurrence_rule else None,
    )
    return TransactionResponse.model_validate(tx)


@router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    context: WorkspaceMemberDep,
    session: DbSessionDep,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort: Annotated[TransactionSortLiteral, Query()] = "newest",
    type: Annotated[str | None, Query()] = None,
    category_id: Annotated[uuid.UUID | None, Query()] = None,
    account_id: Annotated[uuid.UUID | None, Query()] = None,
    start_date: Annotated[datetime | None, Query()] = None,
    end_date: Annotated[datetime | None, Query()] = None,
    amount_min_cents: Annotated[int | None, Query(ge=0)] = None,
    amount_max_cents: Annotated[int | None, Query(ge=0)] = None,
    recurring: Annotated[bool | None, Query()] = None,
    search: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
) -> PaginatedResponse[TransactionResponse]:
    tx_type = TransactionType(type) if type is not None else None
    total, items = await TransactionService(session).list_transactions(
        workspace=context.workspace,
        limit=_clamp_limit(limit),
        offset=offset,
        sort=sort,
        type=tx_type,
        category_id=category_id,
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
        amount_min_cents=amount_min_cents,
        amount_max_cents=amount_max_cents,
        recurring=recurring,
        search=search,
    )
    return PaginatedResponse[TransactionResponse](
        total=total,
        items=[TransactionResponse.model_validate(item) for item in items],
        limit=_clamp_limit(limit),
        offset=offset,
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: uuid.UUID,
    context: WorkspaceMemberDep,
    session: DbSessionDep,
) -> TransactionResponse:
    tx = await TransactionService(session).get_transaction(
        workspace=context.workspace, transaction_id=transaction_id
    )
    return TransactionResponse.model_validate(tx)


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: uuid.UUID,
    body: TransactionUpdate,
    context: FinanceWriteDep,
    current_user: CurrentUserDep,
    session: DbSessionDep,
) -> TransactionResponse:
    tx = await TransactionService(session).update_transaction(
        workspace=context.workspace,
        actor=current_user,
        transaction_id=transaction_id,
        account_id=body.account_id,
        category_id=body.category_id,
        type=TransactionType(body.type) if body.type is not None else None,
        amount_cents=body.amount_cents,
        description=body.description,
        notes=body.notes,
        transaction_date=body.transaction_date,
        is_recurring=body.is_recurring,
        recurrence_rule=RecurrenceRule(body.recurrence_rule) if body.recurrence_rule else None,
    )
    return TransactionResponse.model_validate(tx)


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: uuid.UUID,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> None:
    await TransactionService(session).delete_transaction(
        workspace=context.workspace, transaction_id=transaction_id
    )
