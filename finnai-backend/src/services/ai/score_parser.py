from __future__ import annotations

import json
import re
from typing import Any

from domain.ai.schemas import FinnAIScorePayload
from domain.exceptions import AIParseException

_FENCE_PATTERN = re.compile(r"```(?:json)?\s*([\s\S]*?)```", re.IGNORECASE)


def parse_score_json(raw_text: str) -> FinnAIScorePayload:
    json_text = _extract_json_text(raw_text)
    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise AIParseException("Failed to parse JSON object from AI response") from exc

    if not isinstance(parsed, dict):
        raise AIParseException("AI response JSON must be an object")

    try:
        return FinnAIScorePayload.model_validate(parsed)
    except Exception as exc:  # noqa: BLE001
        raise AIParseException("Invalid AI score JSON") from exc


def _extract_json_text(raw: str) -> str:
    """Extract a JSON object string from Gemini output (aligned with escalaAi parser)."""
    trimmed = raw.strip()
    if not trimmed:
        raise AIParseException("AI response is empty")

    if trimmed.startswith("{"):
        return trimmed

    fence_match = _FENCE_PATTERN.search(trimmed)
    if fence_match:
        return fence_match.group(1).strip()

    start = trimmed.find("{")
    end = trimmed.rfind("}")
    if start >= 0 and end > start:
        return trimmed[start : end + 1]

    raise AIParseException("AI response does not contain JSON object")
