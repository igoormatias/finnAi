from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

GranularityLiteral = Literal["daily", "weekly", "monthly", "yearly"]
TransactionTypeLiteral = Literal["income", "expense"]


class BiggestTransactionResponse(BaseModel):
    id: uuid.UUID
    amount_cents: int
    description: str


class DashboardOverviewResponse(BaseModel):
    total_balance_cents: int
    monthly_income_cents: int
    monthly_expense_cents: int
    savings_cents: int
    savings_rate: float
    transaction_count: int
    biggest_expense: BiggestTransactionResponse | None
    biggest_income: BiggestTransactionResponse | None


class CashflowPointResponse(BaseModel):
    bucket_start: datetime
    income_cents: int
    expense_cents: int
    cumulative_balance_cents: int


class CashflowResponse(BaseModel):
    granularity: GranularityLiteral
    points: list[CashflowPointResponse]


class CategoryAnalyticsItemResponse(BaseModel):
    category_id: uuid.UUID
    name: str
    total_cents: int
    percent: float


class CategoryAnalyticsResponse(BaseModel):
    type: TransactionTypeLiteral
    items: list[CategoryAnalyticsItemResponse]


class TrendsResponse(BaseModel):
    current_income_cents: int
    current_expense_cents: int
    previous_income_cents: int
    previous_expense_cents: int
    income_growth_rate: float
    expense_growth_rate: float


class AccountAnalyticsItemResponse(BaseModel):
    account_id: uuid.UUID
    name: str
    type: str
    current_balance_cents: int
    monthly_income_cents: int
    monthly_expense_cents: int


class AccountsAnalyticsResponse(BaseModel):
    items: list[AccountAnalyticsItemResponse]


class ExportQuery(BaseModel):
    start_date: datetime
    end_date: datetime
    type: TransactionTypeLiteral | None = None
    category_id: uuid.UUID | None = None
    account_id: uuid.UUID | None = None
    amount_min_cents: int | None = Field(default=None, ge=0)
    amount_max_cents: int | None = Field(default=None, ge=0)
    search: str | None = Field(default=None, min_length=1, max_length=200)


class EmergencyReserveResponse(BaseModel):
    reserved_cents: int
    avg_monthly_expense_cents: int
    target_cents: int
    target_months: int
    coverage_months: float | None = None
    coverage_basis: Literal["avg_3m", "current_month", "goal_implied"] | None = None
    has_emergency_goal: bool
    goal_id: uuid.UUID | None = None


class MonthlyExpensePointResponse(BaseModel):
    month: str
    expense_cents: int
    income_cents: int
    vs_previous_percent: float | None = None


class MonthlyExpensesResponse(BaseModel):
    items: list[MonthlyExpensePointResponse]


class ProjectedCashflowPointResponse(BaseModel):
    bucket_start: datetime
    income_cents: int
    expense_cents: int
    cumulative_balance_cents: int
    is_projected: bool


class ProjectedCashflowResponse(BaseModel):
    granularity: GranularityLiteral
    points: list[ProjectedCashflowPointResponse]
    projected_income_cents: int
    projected_expense_cents: int
    projected_balance_delta_cents: int

