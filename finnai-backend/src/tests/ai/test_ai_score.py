from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from integrations.ai.base import AICompletion
from services.ai.score_parser import parse_score_json
from tests.workspaces.helpers import auth_headers, login


def test_score_parser_extracts_json_with_extra_text() -> None:
    raw = 'prefix {"score": 88, "label": "Ok", "summary": "S", "strengths": [], "weaknesses": [], "tips": [], "badges": []} suffix'
    parsed = parse_score_json(raw)
    assert parsed.score == 88
    assert parsed.label == "Ok"


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
            return
    raise AssertionError("Score was not generated")


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
