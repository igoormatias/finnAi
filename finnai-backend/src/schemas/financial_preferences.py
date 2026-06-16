from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

PeriodPresetLiteral = Literal[
    "7d",
    "30d",
    "1y",
    "last_30_days",
    "last_90_days",
    "this_month",
    "next_30_days",
    "next_90_days",
    "this_year",
    "custom",
]

ReportModeLiteral = Literal["historical", "projected", "complete"]


class FinancialPreferencesResponse(BaseModel):
    emergency_reserve_target_months: int
    include_future_transactions: bool
    include_past_transactions: bool
    include_goals_in_projections: bool
    include_recurrences_in_projections: bool
    default_dashboard_period: PeriodPresetLiteral
    default_reports_period: PeriodPresetLiteral
    default_reports_mode: ReportModeLiteral


class FinancialPreferencesUpdate(BaseModel):
    emergency_reserve_target_months: int | None = Field(default=None, ge=1, le=36)
    include_future_transactions: bool | None = None
    include_past_transactions: bool | None = None
    include_goals_in_projections: bool | None = None
    include_recurrences_in_projections: bool | None = None
    default_dashboard_period: PeriodPresetLiteral | None = None
    default_reports_period: PeriodPresetLiteral | None = None
    default_reports_mode: ReportModeLiteral | None = None
