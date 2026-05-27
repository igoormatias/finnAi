from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from jose import jwt

TEST_ACCESS_SECRET = "test-access-secret-key"


def create_expired_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": now - timedelta(hours=2),
        "exp": now - timedelta(hours=1),
    }
    return jwt.encode(payload, TEST_ACCESS_SECRET, algorithm="HS256")


def test_google_login_creates_user_and_sets_cookie(client: TestClient) -> None:
    response = client.post("/auth/google", json={"id_token": "valid-google-token"})

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "user@example.com"
    assert body["user"]["name"] == "Test User"
    assert "refresh_token" in response.cookies


def test_google_login_existing_user(client: TestClient) -> None:
    first = client.post("/auth/google", json={"id_token": "valid-google-token"})
    second = client.post("/auth/google", json={"id_token": "valid-google-token"})

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["user"]["id"] == second.json()["user"]["id"]


def test_refresh_rotates_token(client: TestClient) -> None:
    login = client.post("/auth/google", json={"id_token": "valid-google-token"})
    old_refresh_cookie = login.cookies.get("refresh_token")

    refresh = client.post("/auth/refresh")
    assert refresh.status_code == 200
    assert refresh.json()["access_token"] != login.json()["access_token"]
    new_refresh_cookie = refresh.cookies.get("refresh_token")
    assert new_refresh_cookie
    assert new_refresh_cookie != old_refresh_cookie

    client.cookies.set("refresh_token", old_refresh_cookie)
    reused = client.post("/auth/refresh")
    assert reused.status_code == 401


def test_me_requires_auth(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_returns_authenticated_user(client: TestClient) -> None:
    login = client.post("/auth/google", json={"id_token": "valid-google-token"})
    access_token = login.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"


def test_invalid_access_token(client: TestClient) -> None:
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 401


def test_expired_access_token(client: TestClient) -> None:
    login = client.post("/auth/google", json={"id_token": "valid-google-token"})
    user_id = login.json()["user"]["id"]
    expired_token = create_expired_access_token(user_id)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401


def test_invalid_google_token(client: TestClient) -> None:
    response = client.post("/auth/google", json={"id_token": "invalid-google-token"})
    assert response.status_code == 401
