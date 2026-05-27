from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from tests.workspaces.helpers import auth_headers, login


def _create_workspace(client: TestClient, token: str, name: str = "Finance WS") -> str:
    created = client.post("/workspaces", json={"name": name}, headers=auth_headers(token))
    assert created.status_code == 201
    return created.json()["slug"]


def _create_category(client: TestClient, token: str, slug: str, type_: str = "income") -> str:
    res = client.post(
        f"/workspaces/{slug}/categories",
        json={
            "name": f"{type_}-cat",
            "type": type_,
            "color": "#111111",
            "icon": "tag",
            "is_fixed": False,
        },
        headers=auth_headers(token),
    )
    assert res.status_code == 201
    return res.json()["id"]


def _create_account(client: TestClient, token: str, slug: str, initial: int = 1000) -> str:
    res = client.post(
        f"/workspaces/{slug}/accounts",
        json={"name": "Main", "type": "checking", "initial_balance_cents": initial},
        headers=auth_headers(token),
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_transaction_persists_across_isolated_requests(client_isolated: TestClient) -> None:
    """Regression: POST must commit so a subsequent GET sees the transaction."""
    token = login(client_isolated, "persist@example.com")
    slug = _create_workspace(client_isolated, token, "Persist WS")

    cat_expense = _create_category(client_isolated, token, slug, "expense")
    account_id = _create_account(client_isolated, token, slug, initial=1000)

    now = datetime.now(timezone.utc)

    created = client_isolated.post(
        f"/workspaces/{slug}/transactions",
        json={
            "account_id": account_id,
            "category_id": cat_expense,
            "type": "expense",
            "amount_cents": 500,
            "description": "Supermercado",
            "notes": None,
            "transaction_date": now.isoformat(),
            "is_recurring": False,
            "recurrence_rule": None,
        },
        headers=auth_headers(token),
    )
    assert created.status_code == 201
    tx_id = created.json()["id"]

    listed = client_isolated.get(
        f"/workspaces/{slug}/transactions?limit=20&offset=0&sort=newest",
        headers=auth_headers(token),
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["total"] >= 1
    assert any(item["id"] == tx_id for item in body["items"])

    acc = client_isolated.get(
        f"/workspaces/{slug}/accounts/{account_id}",
        headers=auth_headers(token),
    )
    assert acc.status_code == 200
    assert acc.json()["current_balance_cents"] == 500


def test_transaction_balance_create_update_delete(client: TestClient) -> None:
    token = login(client, "owner@example.com")
    slug = _create_workspace(client, token, "Saldo WS")

    cat_income = _create_category(client, token, slug, "income")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug, initial=1000)

    now = datetime.now(timezone.utc)

    created = client.post(
        f"/workspaces/{slug}/transactions",
        json={
            "account_id": account_id,
            "category_id": cat_income,
            "type": "income",
            "amount_cents": 500,
            "description": "Salary",
            "notes": None,
            "transaction_date": now.isoformat(),
            "is_recurring": False,
            "recurrence_rule": None,
        },
        headers=auth_headers(token),
    )
    assert created.status_code == 201
    tx_id = created.json()["id"]

    acc = client.get(f"/workspaces/{slug}/accounts/{account_id}", headers=auth_headers(token))
    assert acc.status_code == 200
    assert acc.json()["current_balance_cents"] == 1500

    updated = client.patch(
        f"/workspaces/{slug}/transactions/{tx_id}",
        json={
            "category_id": cat_expense,
            "type": "expense",
            "amount_cents": 200,
        },
        headers=auth_headers(token),
    )
    assert updated.status_code == 200

    acc2 = client.get(f"/workspaces/{slug}/accounts/{account_id}", headers=auth_headers(token))
    assert acc2.status_code == 200
    assert acc2.json()["current_balance_cents"] == 800

    deleted = client.delete(
        f"/workspaces/{slug}/transactions/{tx_id}",
        headers=auth_headers(token),
    )
    assert deleted.status_code == 204

    acc3 = client.get(f"/workspaces/{slug}/accounts/{account_id}", headers=auth_headers(token))
    assert acc3.status_code == 200
    assert acc3.json()["current_balance_cents"] == 1000


def test_transactions_filters_pagination_sorting_and_dashboard_summary(client: TestClient) -> None:
    token = login(client, "owner2@example.com")
    slug = _create_workspace(client, token, "Filtro WS")

    cat_income = _create_category(client, token, slug, "income")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug, initial=0)

    now = datetime.now(timezone.utc)
    earlier = now - timedelta(days=5)

    t1 = client.post(
        f"/workspaces/{slug}/transactions",
        json={
            "account_id": account_id,
            "category_id": cat_income,
            "type": "income",
            "amount_cents": 1000,
            "description": "income-a",
            "notes": None,
            "transaction_date": earlier.isoformat(),
            "is_recurring": False,
            "recurrence_rule": None,
        },
        headers=auth_headers(token),
    )
    assert t1.status_code == 201

    t2 = client.post(
        f"/workspaces/{slug}/transactions",
        json={
            "account_id": account_id,
            "category_id": cat_expense,
            "type": "expense",
            "amount_cents": 300,
            "description": "rent",
            "notes": "fixed",
            "transaction_date": now.isoformat(),
            "is_recurring": True,
            "recurrence_rule": "monthly",
        },
        headers=auth_headers(token),
    )
    assert t2.status_code == 201

    listed = client.get(
        f"/workspaces/{slug}/transactions?limit=1&offset=0&sort=newest",
        headers=auth_headers(token),
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["total"] == 2
    assert len(body["items"]) == 1

    sorted_amount = client.get(
        f"/workspaces/{slug}/transactions?sort=amount_desc",
        headers=auth_headers(token),
    )
    assert sorted_amount.status_code == 200
    items = sorted_amount.json()["items"]
    assert items[0]["amount_cents"] == 1000

    filtered = client.get(
        f"/workspaces/{slug}/transactions?recurring=true&search=rent",
        headers=auth_headers(token),
    )
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["is_recurring"] is True

    summary = client.get(f"/workspaces/{slug}/dashboard/summary", headers=auth_headers(token))
    assert summary.status_code == 200
    s = summary.json()
    assert s["total_balance_cents"] == 700
    assert s["total_incomes_cents"] == 1000
    assert s["total_expenses_cents"] == 300
    assert s["monthly_balance_cents"] == 700


def test_viewer_cannot_write_finance(client: TestClient) -> None:
    owner_token = login(client, "owner3@example.com")
    viewer_token = login(client, "viewer@example.com")
    slug = _create_workspace(client, owner_token, "Viewer WS")

    invite = client.post(
        f"/workspaces/{slug}/invites",
        json={"invited_email": "viewer@example.com", "role": "viewer"},
        headers=auth_headers(owner_token),
    )
    assert invite.status_code == 201
    token = invite.json()["token"]

    accepted = client.post(f"/invites/{token}/accept", headers=auth_headers(viewer_token))
    assert accepted.status_code == 200

    denied = client.post(
        f"/workspaces/{slug}/categories",
        json={"name": "Denied", "type": "income"},
        headers=auth_headers(viewer_token),
    )
    assert denied.status_code == 403
