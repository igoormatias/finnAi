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


def test_emergency_reserve_avg_3m_coverage(client: TestClient) -> None:
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
    assert body["coverage_basis"] == "avg_3m"
    assert body["coverage_months"] == 3.0


def test_emergency_reserve_current_month_fallback(client: TestClient) -> None:
    token = login(client, "reserve-current@example.com")
    slug = _create_workspace(client, token, "Reserve Current WS")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug)

    now = datetime.now(timezone.utc)
    _create_tx(client, token, slug, account_id, cat_expense, "expense", 12000, now, "bill-now")

    client.post(
        f"/workspaces/{slug}/goals",
        json={
            "name": "Reserva",
            "goal_type": "emergency_reserve",
            "target_amount_cents": 72000,
            "current_amount_cents": 24000,
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
    assert body["coverage_basis"] == "current_month"
    assert body["avg_monthly_expense_cents"] == 12000
    assert body["coverage_months"] == 2.0


def test_emergency_reserve_goal_implied_fallback(client: TestClient) -> None:
    token = login(client, "reserve-goal@example.com")
    slug = _create_workspace(client, token, "Reserve Goal WS")

    client.post(
        f"/workspaces/{slug}/goals",
        json={
            "name": "Reserva",
            "goal_type": "emergency_reserve",
            "target_amount_cents": 3000000,
            "current_amount_cents": 2800000,
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
    assert body["coverage_basis"] == "goal_implied"
    assert body["avg_monthly_expense_cents"] == 500000
    assert body["coverage_months"] == 5.6


def test_emergency_reserve_no_data_returns_null_coverage(client: TestClient) -> None:
    token = login(client, "reserve-empty@example.com")
    slug = _create_workspace(client, token, "Reserve Empty WS")

    res = client.get(
        f"/workspaces/{slug}/dashboard/emergency-reserve",
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    body = res.json()
    assert body["coverage_months"] is None
    assert body["coverage_basis"] is None
    assert body["avg_monthly_expense_cents"] == 0


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
