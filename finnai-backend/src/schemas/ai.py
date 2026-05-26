from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class FinnAIScoreResponse(BaseModel):
    workspace_id: uuid.UUID
    score: int
    label: str
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    tips: list[str]
    badges: list[str]
    generated_at: datetime


class RegenerateResponse(BaseModel):
    status: str
    debounced: bool
