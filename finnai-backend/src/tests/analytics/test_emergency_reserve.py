from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from tests.analytics.test_dashboard_v5 import (
    _create_account,
    _create_category,
    _create_tx,
    _create_workspace,
)
from tests.workspaces.helpers import auth_headers, login


def test_emergency_reserve_endpoint(client: TestClient) -> None:
    token = login(client, "reserve-owner@example.com")
    slug = _create_workspace(client, token, "Reserve WS")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug, initial=50000)

    now = datetime.now(timezone.utc)
    for i in range(3):
        when = now - timedelta(days=30 * (i + 1))
        _create_tx(client, token, slug, account_id, cat_expense, "expense", 10000, when, f"rent-{i}")

    client.post(
        f"/workspaces/{slug}/goals",
        json={
            "name": "Reserva",
            "goal_type": "emergency_reserve",
            "target_amount_cents": 60000,
            "current_amount_cents": 30000,
            "priority": "high",
        },
        headers=auth_headers(token),
    )

    res = client.get(
        f"/workspaces/{slug}/dashboard/emergency-reserve",
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    body = res.json()
    assert body["reserved_cents"] == 30000
    assert body["has_emergency_goal"] is True
    assert body["coverage_months"] >= 0


def test_monthly_expenses_endpoint(client: TestClient) -> None:
    token = login(client, "monthly-owner@example.com")
    slug = _create_workspace(client, token, "Monthly WS")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug)

    now = datetime.now(timezone.utc)
    _create_tx(client, token, slug, account_id, cat_expense, "expense", 5000, now, "bill")

    res = client.get(
        f"/workspaces/{slug}/dashboard/monthly-expenses",
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) == 12
    assert items[-1]["expense_cents"] == 5000
