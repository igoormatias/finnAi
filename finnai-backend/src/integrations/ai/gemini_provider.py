from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import httpx

from core.config import Settings
from domain.exceptions import AIProviderException
from integrations.ai.base import AICompletion

logger = logging.getLogger(__name__)

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
FALLBACK_GEMINI_MODEL = "gemini-flash-latest"
LEGACY_GEMINI_MODEL = "gemini-1.5-flash"


@dataclass(frozen=True)
class GeminiProvider:
    settings: Settings

    async def complete_json(self, *, prompt: str) -> AICompletion:
        api_key = self.settings.gemini_api_key
        if not api_key:
            raise AIProviderException("GEMINI_API_KEY is not configured")

        preferred = (
            self.settings.gemini_model
            or self.settings.ai_model
            or DEFAULT_GEMINI_MODEL
        ).strip()
        models_to_try = _resolve_models_to_try(preferred)

        last_error: Exception | None = None
        for model in models_to_try:
            try:
                return await self._generate_with_model(api_key=api_key, model=model, prompt=prompt)
            except AIProviderException as exc:
                last_error = exc
                logger.warning("Gemini model %s failed: %s", model, exc.message)
                continue

        raise AIProviderException(
            last_error.message if last_error else "All Gemini models failed"
        )

    async def _generate_with_model(self, *, api_key: str, model: str, prompt: str) -> AICompletion:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json",
            },
        }

        timeout = httpx.Timeout(45.0, connect=5.0)
        started = time.perf_counter()
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                resp = await client.post(url, params={"key": api_key}, json=payload)
            except httpx.HTTPError as exc:
                raise AIProviderException("Gemini request failed") from exc

        if resp.status_code >= 400:
            raise AIProviderException(f"Gemini error {resp.status_code}: {resp.text}")

        data = resp.json()
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as exc:  # noqa: BLE001
            raise AIProviderException("Gemini response missing text") from exc

        if not str(text).strip():
            raise AIProviderException("Gemini returned empty response")

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        _ = elapsed_ms

        return AICompletion(raw_text=str(text), raw_json=data, model=model)


def _resolve_models_to_try(preferred: str) -> list[str]:
    ordered = [preferred, DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODEL, LEGACY_GEMINI_MODEL]
    seen: set[str] = set()
    models: list[str] = []
    for model in ordered:
        if model and model not in seen:
            seen.add(model)
            models.append(model)
    return models
