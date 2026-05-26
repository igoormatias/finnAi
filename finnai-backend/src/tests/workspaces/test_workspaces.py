from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from tests.workspaces.helpers import auth_headers, login


def test_create_workspace(client: TestClient) -> None:
    token = login(client)
    response = client.post(
        "/workspaces",
        json={"name": "Familia Silva"},
        headers=auth_headers(token),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Familia Silva"
    assert body["slug"] == "familia-silva"


def test_list_workspaces_only_for_member(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")
    other_token = login(client, "other@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Familia Silva"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    owner_list = client.get("/workspaces", headers=auth_headers(owner_token))
    other_list = client.get("/workspaces", headers=auth_headers(other_token))

    assert owner_list.status_code == 200
    assert any(item["slug"] == slug for item in owner_list.json())
    assert all(item["slug"] != slug for item in other_list.json())


def test_get_workspace_requires_membership(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")
    outsider_token = login(client, "outsider@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Workspace Privado"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    allowed = client.get(f"/workspaces/{slug}", headers=auth_headers(owner_token))
    denied = client.get(f"/workspaces/{slug}", headers=auth_headers(outsider_token))

    assert allowed.status_code == 200
    assert denied.status_code == 403


def test_invite_and_accept(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")
    invitee_token = login(client, "invitee@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Familia Convite"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "invitee@example.com", "role": "member"},
        headers=auth_headers(owner_token),
    )
    assert invite.status_code == 201
    token = invite.json()["token"]

    accepted = client.post(
        f"/invites/{token}/accept",
        headers=auth_headers(invitee_token),
    )
    assert accepted.status_code == 200
    assert accepted.json()["role"] == "member"

    members = client.get(f"/workspaces/{slug}/members", headers=auth_headers(owner_token))
    assert members.status_code == 200
    assert any(m["user_email"] == "invitee@example.com" for m in members.json())


def test_viewer_cannot_create_invite(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")
    viewer_token = login(client, "viewer@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Workspace Viewer"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    invite_viewer = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "viewer@example.com", "role": "viewer"},
        headers=auth_headers(owner_token),
    )
    assert invite_viewer.status_code == 201
    viewer_invite_token = invite_viewer.json()["token"]

    accept = client.post(
        f"/invites/{viewer_invite_token}/accept",
        headers=auth_headers(viewer_token),
    )
    assert accept.status_code == 200

    denied = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "new@example.com", "role": "member"},
        headers=auth_headers(viewer_token),
    )
    assert denied.status_code == 403


def test_member_cannot_update_roles(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")
    member_token = login(client, "member@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Workspace Roles"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "member@example.com", "role": "member"},
        headers=auth_headers(owner_token),
    )
    member_invite_token = invite.json()["token"]
    client.post(f"/invites/{member_invite_token}/accept", headers=auth_headers(member_token))

    members = client.get(f"/workspaces/{slug}/members", headers=auth_headers(owner_token))
    target_id = next(m["id"] for m in members.json() if m["user_email"] == "member@example.com")

    denied = client.patch(
        f"/workspaces/{slug}/members/{target_id}",
        json={"role": "admin"},
        headers=auth_headers(member_token),
    )
    assert denied.status_code == 403


def test_owner_can_delete_workspace(client: TestClient) -> None:
    owner_token = login(client, "owner@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Workspace Delete"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    deleted = client.delete(f"/workspaces/{slug}", headers=auth_headers(owner_token))
    assert deleted.status_code == 204

    get_after = client.get(f"/workspaces/{slug}", headers=auth_headers(owner_token))
    assert get_after.status_code == 404


def test_expired_invite_cannot_be_accepted(client: TestClient, db_session) -> None:
    import asyncio

    owner_token = login(client, "owner@example.com")
    invitee_token = login(client, "invitee2@example.com")

    created = client.post(
        "/workspaces",
        json={"name": "Workspace Expired"},
        headers=auth_headers(owner_token),
    )
    slug = created.json()["slug"]

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "invitee2@example.com", "role": "member"},
        headers=auth_headers(owner_token),
    )
    token = invite.json()["token"]

    async def expire_invite() -> None:
        from repositories.invite_repository import InviteRepository

        repo = InviteRepository(db_session)
        record = await repo.get_by_token(token)
        assert record is not None
        record.expires_at = datetime.now(UTC) - timedelta(days=1)
        await db_session.commit()

    asyncio.get_event_loop().run_until_complete(expire_invite())

    response = client.post(
        f"/invites/{token}/accept",
        headers=auth_headers(invitee_token),
    )
    assert response.status_code == 400
