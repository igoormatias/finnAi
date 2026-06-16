from __future__ import annotations

import json
import re

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
    """Extract a JSON object string from Gemini output."""
    trimmed = raw.strip()
    if not trimmed:
        raise AIParseException("AI response is empty")

    fence_match = _FENCE_PATTERN.search(trimmed)
    if fence_match:
        return _extract_balanced_object(fence_match.group(1).strip())

    if trimmed.startswith("{"):
        return _extract_balanced_object(trimmed)

    start = trimmed.find("{")
    if start == -1:
        raise AIParseException("AI response does not contain JSON object")

    return _extract_balanced_object(trimmed[start:])


def _extract_balanced_object(text: str) -> str:
    start = text.find("{")
    if start == -1:
        raise AIParseException("AI response does not contain JSON object")

    depth = 0
    in_string = False
    escape = False

    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]

    raise AIParseException("Unbalanced JSON braces in AI response")
