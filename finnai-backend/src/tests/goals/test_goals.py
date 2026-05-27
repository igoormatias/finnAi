from __future__ import annotations

from fastapi.testclient import TestClient

from tests.workspaces.helpers import auth_headers, login


def _create_workspace(client: TestClient, token: str, name: str = "Goals WS") -> str:
    created = client.post("/workspaces", json={"name": name}, headers=auth_headers(token))
    assert created.status_code == 201
    return created.json()["slug"]


def _goal_payload(**overrides) -> dict:
    base = {
        "name": "Reserva de emergência",
        "description": "6 meses de despesas",
        "goal_type": "emergency_reserve",
        "target_amount_cents": 100_000,
        "current_amount_cents": 25_000,
        "priority": "high",
    }
    base.update(overrides)
    return base


def test_goals_crud_and_overview(client: TestClient) -> None:
    token = login(client, "goals-owner@example.com")
    slug = _create_workspace(client, token)

    created = client.post(
        f"/workspaces/{slug}/goals",
        json=_goal_payload(),
        headers=auth_headers(token),
    )
    assert created.status_code == 201
    goal_id = created.json()["id"]
    assert created.json()["status"] == "active"

    listed = client.get(f"/workspaces/{slug}/goals", headers=auth_headers(token))
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    overview = client.get(f"/workspaces/{slug}/goals/overview", headers=auth_headers(token))
    assert overview.status_code == 200
    body = overview.json()
    assert body["active_count"] == 1
    assert body["total_saved_cents"] == 25_000

    contribution = client.post(
        f"/workspaces/{slug}/goals/{goal_id}/contributions",
        json={"amount_cents": 75_000},
        headers=auth_headers(token),
    )
    assert contribution.status_code == 200
    assert contribution.json()["status"] == "completed"
    assert contribution.json()["current_amount_cents"] == 100_000

    overview2 = client.get(f"/workspaces/{slug}/goals/overview", headers=auth_headers(token))
    assert overview2.json()["completed_count"] == 1

    deleted = client.delete(
        f"/workspaces/{slug}/goals/{goal_id}",
        headers=auth_headers(token),
    )
    assert deleted.status_code == 204


def test_viewer_cannot_create_goal(client: TestClient) -> None:
    owner_token = login(client, "goals-owner2@example.com")
    viewer_token = login(client, "goals-viewer@example.com")
    slug = _create_workspace(client, owner_token, "Goals WS Perm")

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "goals-viewer@example.com", "role": "viewer"},
        headers=auth_headers(owner_token),
    )
    token = invite.json()["token"]
    accepted = client.post(f"/invites/{token}/accept", headers=auth_headers(viewer_token))
    assert accepted.status_code == 200

    regen = client.post(
        f"/workspaces/{slug}/goals",
        json=_goal_payload(),
        headers=auth_headers(viewer_token),
    )
    assert regen.status_code == 403
