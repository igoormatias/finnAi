from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from integrations.ai.base import AICompletion
from services.ai.score_parser import parse_score_json
from services.ai.prompt_builder import build_financial_score_prompt
from tests.workspaces.helpers import auth_headers, login


def test_score_parser_extracts_json_with_extra_text() -> None:
    raw = 'prefix {"score": 88, "label": "Ok", "summary": "S", "strengths": [], "weaknesses": [], "tips": [], "badges": []} suffix'
    parsed = parse_score_json(raw)
    assert parsed.score == 88
    assert parsed.label == "Ok"


@pytest.mark.asyncio
async def test_mark_requested_clears_last_error() -> None:
    import uuid
    from unittest.mock import AsyncMock

    from core.config import get_settings
    from models.workspace_financial_score import WorkspaceFinancialScore
    from services.ai.ai_cache_service import AIScoreCacheService

    score = WorkspaceFinancialScore(
        workspace_id=uuid.uuid4(),
        status="failed",
        last_error="previous failure",
    )
    session = AsyncMock()
    cache = AIScoreCacheService(session, get_settings())
    await cache.mark_requested(score)
    assert score.status == "pending"
    assert score.last_error is None
    assert score.generation_epoch == 1


def test_score_parser_extracts_json_from_markdown_fence() -> None:
    raw = """```json
{"score": 70, "label": "Bom", "summary": "Resumo curto", "strengths": ["A"], "weaknesses": ["B"], "tips": ["C"], "badges": ["D"]}
```"""
    parsed = parse_score_json(raw)
    assert parsed.score == 70
    assert parsed.label == "Bom"


def test_score_parser_raises_on_truncated_json() -> None:
    from domain.exceptions import AIParseException

    raw = '{"score": 65, "label": "Ok", "summary": "Incompleto", "strengths": ["A"'
    with pytest.raises(AIParseException, match="Unbalanced JSON braces"):
        parse_score_json(raw)


def test_score_parser_extracts_first_object_with_trailing_text() -> None:
    raw = (
        '{"score": 80, "label": "Bom", "summary": "S", "strengths": [], '
        '"weaknesses": [], "tips": [], "badges": []} trailing garbage'
    )
    parsed = parse_score_json(raw)
    assert parsed.score == 80


def test_financial_score_prompt_enforces_ptbr() -> None:
    prompt = build_financial_score_prompt(input_payload={"x": 1})
    assert "português (pt-BR)" in prompt.prompt
    assert "Não use inglês" in prompt.prompt


def test_ai_endpoints_regenerate_and_get_score(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Override provider via dependency override on app created in conftest is not exposed;
    # Instead we monkeypatch GeminiProvider.complete_json at runtime.
    from integrations.ai.gemini_provider import GeminiProvider

    async def fake_complete_json(self, *, prompt: str) -> AICompletion:  # noqa: ARG001
        return AICompletion(
            raw_text='{"score": 90, "label": "Excelente controle financeiro", "summary": "Resumo", "strengths": ["A"], "weaknesses": ["B"], "tips": ["C"], "badges": ["Economista Nato"]}',
            raw_json={"mock": True},
            model="mock",
        )

    monkeypatch.setattr(GeminiProvider, "complete_json", fake_complete_json, raising=True)

    token = login(client, "ai-owner@example.com")
    ws = client.post("/workspaces", json={"name": "AI WS"}, headers=auth_headers(token))
    assert ws.status_code == 201
    slug = ws.json()["slug"]

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
    assert regen.status_code == 202

    # Regeneration runs in background task; poll a few times
    for _ in range(10):
        got = client.get(f"/workspaces/{slug}/ai/score", headers=auth_headers(token))
        if got.status_code == 200:
            body = got.json()
            assert body["score"] == 90
            assert body["badges"] == ["Economista Nato"]
            assert body["status"] == "idle"
            return
    raise AssertionError("Score was not generated")


def test_ai_score_failed_exposes_status_and_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from integrations.ai.gemini_provider import GeminiProvider

    async def failing_complete_json(self, *, prompt: str) -> AICompletion:  # noqa: ARG001
        raise RuntimeError("boom")

    monkeypatch.setattr(GeminiProvider, "complete_json", failing_complete_json, raising=True)

    token = login(client, "ai-owner3@example.com")
    ws = client.post("/workspaces", json={"name": "AI WS Fail"}, headers=auth_headers(token))
    assert ws.status_code == 201
    slug = ws.json()["slug"]

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
    assert regen.status_code == 202

    got = client.get(f"/workspaces/{slug}/ai/score", headers=auth_headers(token))
    assert got.status_code == 200
    body = got.json()
    assert body["status"] == "failed"
    assert body.get("last_error")


def test_ai_score_retries_when_response_is_english(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from integrations.ai.gemini_provider import GeminiProvider

    calls = {"n": 0}

    async def english_then_ptbr(self, *, prompt: str) -> AICompletion:  # noqa: ARG001
        calls["n"] += 1
        if calls["n"] == 1:
            return AICompletion(
                raw_text='{"score": 95, "label": "Exceptional Financial Health", "summary": "You have strong savings.", "strengths": ["Strong savings"], "weaknesses": [], "tips": [], "badges": ["Wealth Builder"]}',
                raw_json={"mock": True, "lang": "en"},
                model="mock",
            )
        return AICompletion(
            raw_text='{"score": 95, "label": "Saúde financeira excepcional", "summary": "Você tem uma ótima taxa de poupança.", "strengths": ["Boa taxa de poupança"], "weaknesses": [], "tips": [], "badges": ["Construtor de Patrimônio"]}',
            raw_json={"mock": True, "lang": "pt"},
            model="mock",
        )

    monkeypatch.setattr(GeminiProvider, "complete_json", english_then_ptbr, raising=True)

    token = login(client, "ai-owner4@example.com")
    ws = client.post("/workspaces", json={"name": "AI WS Lang"}, headers=auth_headers(token))
    slug = ws.json()["slug"]

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
    assert regen.status_code == 202

    for _ in range(10):
        got = client.get(f"/workspaces/{slug}/ai/score", headers=auth_headers(token))
        if got.status_code == 200:
            body = got.json()
            assert body["status"] == "idle"
            assert calls["n"] >= 2
            assert "Saúde" in body["label"] or "saúde" in body["label"]
            return
    raise AssertionError("Score was not generated")


def test_ai_score_fails_when_response_stays_english_after_retry(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from integrations.ai.gemini_provider import GeminiProvider

    async def always_english(self, *, prompt: str) -> AICompletion:  # noqa: ARG001
        return AICompletion(
            raw_text='{"score": 90, "label": "Exceptional Financial Health", "summary": "You have strong savings.", "strengths": ["Strong savings"], "weaknesses": [], "tips": [], "badges": ["Wealth Builder"]}',
            raw_json={"mock": True, "lang": "en"},
            model="mock",
        )

    monkeypatch.setattr(GeminiProvider, "complete_json", always_english, raising=True)

    token = login(client, "ai-owner5@example.com")
    ws = client.post("/workspaces", json={"name": "AI WS Lang Fail"}, headers=auth_headers(token))
    slug = ws.json()["slug"]

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
    assert regen.status_code == 202

    got = client.get(f"/workspaces/{slug}/ai/score", headers=auth_headers(token))
    assert got.status_code == 200
    body = got.json()
    assert body["status"] == "failed"
    assert "pt-BR" in (body.get("last_error") or "")


def test_viewer_cannot_regenerate(client: TestClient) -> None:
    owner_token = login(client, "ai-owner2@example.com")
    viewer_token = login(client, "ai-viewer@example.com")

    ws = client.post("/workspaces", json={"name": "AI WS2"}, headers=auth_headers(owner_token))
    slug = ws.json()["slug"]

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "ai-viewer@example.com", "role": "viewer"},
        headers=auth_headers(owner_token),
    )
    token = invite.json()["token"]
    accepted = client.post(f"/invites/{token}/accept", headers=auth_headers(viewer_token))
    assert accepted.status_code == 200

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(viewer_token))
    assert regen.status_code == 403


@pytest.mark.asyncio
async def test_should_debounce_bypasses_when_failed_within_retry_limit() -> None:
    import uuid
    from datetime import datetime, timezone
    from unittest.mock import AsyncMock

    from core.config import get_settings
    from models.workspace_financial_score import WorkspaceFinancialScore
    from services.ai.ai_cache_service import AIScoreCacheService

    score = WorkspaceFinancialScore(
        workspace_id=uuid.uuid4(),
        status="failed",
        failure_attempt_count=3,
        last_requested_at=datetime.now(timezone.utc),
    )
    cache = AIScoreCacheService(AsyncMock(), get_settings())
    assert await cache.should_debounce(score) is False


@pytest.mark.asyncio
async def test_should_debounce_after_failure_retry_limit_exhausted() -> None:
    import uuid
    from datetime import datetime, timezone
    from unittest.mock import AsyncMock

    from core.config import get_settings
    from models.workspace_financial_score import WorkspaceFinancialScore
    from services.ai.ai_cache_service import AIScoreCacheService

    score = WorkspaceFinancialScore(
        workspace_id=uuid.uuid4(),
        status="failed",
        failure_attempt_count=6,
        last_requested_at=datetime.now(timezone.utc),
    )
    cache = AIScoreCacheService(AsyncMock(), get_settings())
    assert await cache.should_debounce(score) is True
    assert cache.retries_remaining(score) == 0


@pytest.mark.asyncio
async def test_mark_failed_increments_failure_attempt_count() -> None:
    import uuid
    from unittest.mock import AsyncMock

    from core.config import get_settings
    from models.workspace_financial_score import WorkspaceFinancialScore
    from services.ai.ai_cache_service import AIScoreCacheService

    score = WorkspaceFinancialScore(
        workspace_id=uuid.uuid4(),
        status="pending",
        failure_attempt_count=0,
    )
    cache = AIScoreCacheService(AsyncMock(), get_settings())
    await cache.mark_failed(score, "boom")
    assert score.failure_attempt_count == 1
    assert score.status == "failed"


def test_ai_score_allows_immediate_retries_after_failure(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from integrations.ai.gemini_provider import GeminiProvider

    async def failing_complete_json(self, *, prompt: str) -> AICompletion:  # noqa: ARG001
        raise RuntimeError("boom")

    monkeypatch.setattr(GeminiProvider, "complete_json", failing_complete_json, raising=True)

    token = login(client, "ai-retry-owner@example.com")
    ws = client.post("/workspaces", json={"name": "AI WS Retry"}, headers=auth_headers(token))
    slug = ws.json()["slug"]

    for _ in range(6):
        regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
        assert regen.status_code == 202
        assert regen.json()["debounced"] is False

    regen = client.post(f"/workspaces/{slug}/ai/regenerate", headers=auth_headers(token))
    assert regen.status_code == 202
    body = regen.json()
    assert body["debounced"] is True
    assert body["retries_remaining"] == 0
