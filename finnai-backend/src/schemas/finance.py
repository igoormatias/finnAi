from __future__ import annotations

import uuid
from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field

CategoryTypeLiteral = Literal["income", "expense"]
AccountTypeLiteral = Literal["checking", "savings", "wallet", "credit_card", "investment"]
TransactionTypeLiteral = Literal["income", "expense"]
RecurrenceRuleLiteral = Literal["weekly", "monthly", "yearly"]
TransactionSortLiteral = Literal["newest", "oldest", "amount_asc", "amount_desc"]

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: list[T]
    limit: int
    offset: int


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: CategoryTypeLiteral
    color: str = Field(default="#64748b", min_length=1, max_length=32)
    icon: str = Field(default="tag", min_length=1, max_length=64)
    is_fixed: bool = False


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    color: str | None = Field(default=None, min_length=1, max_length=32)
    icon: str | None = Field(default=None, min_length=1, max_length=64)
    is_fixed: bool | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    type: CategoryTypeLiteral
    color: str
    icon: str
    is_fixed: bool
    created_at: datetime
    updated_at: datetime


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: AccountTypeLiteral
    initial_balance_cents: int = 0


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: AccountTypeLiteral | None = None


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    type: AccountTypeLiteral
    initial_balance_cents: int
    current_balance_cents: int
    created_at: datetime
    updated_at: datetime


class TransactionCreate(BaseModel):
    account_id: uuid.UUID
    category_id: uuid.UUID
    type: TransactionTypeLiteral
    amount_cents: int = Field(gt=0)
    description: str = Field(default="", max_length=255)
    notes: str | None = None
    transaction_date: datetime
    is_recurring: bool = False
    recurrence_rule: RecurrenceRuleLiteral | None = None


class TransactionUpdate(BaseModel):
    account_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    type: TransactionTypeLiteral | None = None
    amount_cents: int | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, max_length=255)
    notes: str | None = None
    transaction_date: datetime | None = None
    is_recurring: bool | None = None
    recurrence_rule: RecurrenceRuleLiteral | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    account_id: uuid.UUID
    category_id: uuid.UUID
    created_by: uuid.UUID
    type: TransactionTypeLiteral
    amount_cents: int
    description: str
    notes: str | None
    transaction_date: datetime
    is_recurring: bool
    recurrence_rule: RecurrenceRuleLiteral | None
    created_at: datetime
    updated_at: datetime


class TransactionFilters(BaseModel):
    type: TransactionTypeLiteral | None = None
    category_id: uuid.UUID | None = None
    account_id: uuid.UUID | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    amount_min_cents: int | None = None
    amount_max_cents: int | None = None
    recurring: bool | None = None
    search: str | None = None


class DashboardSummaryResponse(BaseModel):
    total_balance_cents: int
    total_incomes_cents: int
    total_expenses_cents: int
    monthly_balance_cents: int
    savings_rate: float
