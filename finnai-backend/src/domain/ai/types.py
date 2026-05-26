from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class AIProviderName(StrEnum):
    gemini = "gemini"
    openai = "openai"
    claude = "claude"
    openrouter = "openrouter"


@dataclass(frozen=True)
class FinnAIScore:
    score: int
    label: str
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    tips: list[str]
    badges: list[str]


@dataclass(frozen=True)
class FinnAIScoreResult:
    score: FinnAIScore
    provider: str
    model: str | None
    raw_response: dict
