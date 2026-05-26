from __future__ import annotations

from fastapi.testclient import TestClient


def login(client: TestClient, email: str = "user@example.com") -> str:
    token_id = f"email:{email}" if email != "user@example.com" else "valid-google-token"
    response = client.post("/auth/google", json={"id_token": token_id})
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}
