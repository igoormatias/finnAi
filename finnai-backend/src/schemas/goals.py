from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

GoalTypeLiteral = Literal[
    "emergency_reserve",
    "travel",
    "car",
    "house",
    "investment",
    "education",
    "shopping",
    "custom",
]
GoalPriorityLiteral = Literal["low", "medium", "high"]
GoalStatusLiteral = Literal["active", "completed", "paused"]


class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    goal_type: GoalTypeLiteral
    target_amount_cents: int = Field(gt=0)
    current_amount_cents: int = Field(default=0, ge=0)
    target_date: date | None = None
    priority: GoalPriorityLiteral = "medium"


class GoalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    goal_type: GoalTypeLiteral | None = None
    target_amount_cents: int | None = Field(default=None, gt=0)
    current_amount_cents: int | None = Field(default=None, ge=0)
    target_date: date | None = None
    priority: GoalPriorityLiteral | None = None
    status: GoalStatusLiteral | None = None


class GoalContributionCreate(BaseModel):
    amount_cents: int = Field(gt=0)
    contributed_at: date | None = None
    notes: str | None = Field(default=None, max_length=2000)


class GoalContributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    goal_id: uuid.UUID
    workspace_id: uuid.UUID
    amount_cents: int
    contributed_at: date
    notes: str | None
    created_by_user_id: uuid.UUID | None
    created_at: datetime


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    description: str | None
    goal_type: GoalTypeLiteral
    target_amount_cents: int
    current_amount_cents: int
    target_date: date | None
    priority: GoalPriorityLiteral
    status: GoalStatusLiteral
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class GoalsOverviewResponse(BaseModel):
    active_count: int
    completed_count: int
    total_saved_cents: int
    total_progress_percent: float
