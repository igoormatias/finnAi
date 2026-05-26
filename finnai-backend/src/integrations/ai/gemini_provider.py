from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

from core.config import Settings
from domain.exceptions import AIProviderException
from integrations.ai.base import AICompletion


@dataclass(frozen=True)
class GeminiProvider:
    settings: Settings

    async def complete_json(self, *, prompt: str) -> AICompletion:
        api_key = self.settings.gemini_api_key
        if not api_key:
            raise AIProviderException("GEMINI_API_KEY is not configured")

        model = self.settings.gemini_model or self.settings.ai_model or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json",
            },
        }

        timeout = httpx.Timeout(20.0, connect=5.0)
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

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        # (Observabilidade): tempo pode ser logado pelo service/orchestrator.
        _ = elapsed_ms

        return AICompletion(raw_text=str(text), raw_json=data, model=model)
