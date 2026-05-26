from __future__ import annotations

import json
from dataclasses import dataclass


@dataclass(frozen=True)
class PromptBuildResult:
    prompt: str
    prompt_version: str


def build_financial_score_prompt(*, input_payload: dict) -> PromptBuildResult:
    prompt_version = "v1"
    schema = {
        "score": 0,
        "label": "string",
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "tips": ["string"],
        "badges": ["string"],
    }
    instructions = (
        "You are FinnAI Score, a financial analyst.\n"
        "Return ONLY valid JSON (no markdown, no extra text).\n"
        "Follow EXACTLY this JSON schema (keys and types):\n"
        f"{json.dumps(schema, ensure_ascii=False)}\n"
        "Constraints:\n"
        "- score must be an integer 0..100\n"
        "- keep lists <= 10 items\n"
        "- be concise and actionable\n"
    )
    payload = json.dumps(input_payload, ensure_ascii=False, separators=(",", ":"))
    prompt = f"{instructions}\nINPUT:\n{payload}\n"
    return PromptBuildResult(prompt=prompt, prompt_version=prompt_version)
