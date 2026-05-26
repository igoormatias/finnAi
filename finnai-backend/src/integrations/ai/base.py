from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AICompletion:
    raw_text: str
    raw_json: dict
    model: str | None


class AIProvider(Protocol):
    async def complete_json(self, *, prompt: str) -> AICompletion: ...
