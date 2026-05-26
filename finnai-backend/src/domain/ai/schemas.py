from __future__ import annotations

from pydantic import BaseModel, Field


class FinnAIScorePayload(BaseModel):
    score: int = Field(ge=0, le=100)
    label: str = Field(min_length=1, max_length=255)
    summary: str = Field(min_length=1, max_length=5000)
    strengths: list[str] = Field(default_factory=list, max_length=10)
    weaknesses: list[str] = Field(default_factory=list, max_length=10)
    tips: list[str] = Field(default_factory=list, max_length=10)
    badges: list[str] = Field(default_factory=list, max_length=10)
