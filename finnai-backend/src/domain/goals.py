from __future__ import annotations

from enum import Enum


class GoalType(str, Enum):
    emergency_reserve = "emergency_reserve"
    travel = "travel"
    car = "car"
    house = "house"
    investment = "investment"
    education = "education"
    shopping = "shopping"
    custom = "custom"


class GoalPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class GoalStatus(str, Enum):
    active = "active"
    completed = "completed"
    paused = "paused"
