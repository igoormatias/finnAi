from __future__ import annotations

import json
from typing import Any

from domain.ai.schemas import FinnAIScorePayload
from domain.exceptions import AIParseException


def parse_score_json(raw_text: str) -> FinnAIScorePayload:
    extracted = _extract_json_object(raw_text)
    try:
        payload = FinnAIScorePayload.model_validate(extracted)
    except Exception as exc:  # noqa: BLE001
        raise AIParseException("Invalid AI score JSON") from exc
    return payload


def _extract_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        try:
            return json.loads(text)
        except Exception:  # noqa: BLE001
            pass

    start = text.find("{")
    if start == -1:
        raise AIParseException("AI response does not contain JSON object")

    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                candidate = text[start : i + 1]
                try:
                    return json.loads(candidate)
                except Exception as exc:  # noqa: BLE001
                    raise AIParseException("Failed to parse JSON object from AI response") from exc

    raise AIParseException("Unbalanced JSON braces in AI response")
