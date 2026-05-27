from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from tests.workspaces.helpers import auth_headers, login


def _create_workspace(client: TestClient, token: str, name: str = "Analytics WS") -> str:
    created = client.post("/workspaces", json={"name": name}, headers=auth_headers(token))
    assert created.status_code == 201
    return created.json()["slug"]


def _create_category(client: TestClient, token: str, slug: str, type_: str = "income") -> str:
    res = client.post(
        f"/workspaces/{slug}/categories",
        json={"name": f"{type_}-cat", "type": type_},
        headers=auth_headers(token),
    )
    assert res.status_code == 201
    return res.json()["id"]


def _create_account(client: TestClient, token: str, slug: str, initial: int = 0) -> str:
    res = client.post(
        f"/workspaces/{slug}/accounts",
        json={"name": "Main", "type": "checking", "initial_balance_cents": initial},
        headers=auth_headers(token),
    )
    assert res.status_code == 201
    return res.json()["id"]


def _create_tx(
    client: TestClient,
    token: str,
    slug: str,
    account_id: str,
    category_id: str,
    type_: str,
    amount: int,
    when: datetime,
    desc: str,
) -> None:
    res = client.post(
        f"/workspaces/{slug}/transactions",
        json={
            "account_id": account_id,
            "category_id": category_id,
            "type": type_,
            "amount_cents": amount,
            "description": desc,
            "transaction_date": when.isoformat(),
            "is_recurring": False,
            "recurrence_rule": None,
        },
        headers=auth_headers(token),
    )
    assert res.status_code == 201


def test_dashboard_overview_cashflow_categories_trends_accounts(client: TestClient) -> None:
    token = login(client, "owner-analytics@example.com")
    slug = _create_workspace(client, token)
    cat_income = _create_category(client, token, slug, "income")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug, initial=1000)

    now = datetime.now(timezone.utc)
    earlier = now - timedelta(days=2)
    _create_tx(client, token, slug, account_id, cat_income, "income", 500, earlier, "salary")
    _create_tx(client, token, slug, account_id, cat_expense, "expense", 200, now, "rent")

    overview = client.get(f"/workspaces/{slug}/dashboard/overview", headers=auth_headers(token))
    assert overview.status_code == 200
    o = overview.json()
    assert o["total_balance_cents"] == 1300
    assert o["monthly_income_cents"] == 500
    assert o["monthly_expense_cents"] == 200
    assert o["transaction_count"] == 2
    assert o["biggest_income"]["amount_cents"] == 500
    assert o["biggest_expense"]["amount_cents"] == 200

    cashflow = client.get(
        f"/workspaces/{slug}/dashboard/cashflow",
        params={
            "start_date": earlier.isoformat(),
            "end_date": now.isoformat(),
            "granularity": "daily",
        },
        headers=auth_headers(token),
    )
    assert cashflow.status_code == 200
    cashflow_body = cashflow.json()
    assert cashflow_body["granularity"] == "daily"
    assert cashflow_body["points"]
    assert cashflow_body["points"][-1]["expense_cents"] == 200

    categories = client.get(
        f"/workspaces/{slug}/dashboard/categories",
        params={
            "start_date": earlier.isoformat(),
            "end_date": now.isoformat(),
            "type": "expense",
        },
        headers=auth_headers(token),
    )
    assert categories.status_code == 200
    assert categories.json()["type"] == "expense"
    assert categories.json()["items"][0]["total_cents"] == 200

    trends = client.get(f"/workspaces/{slug}/dashboard/trends", headers=auth_headers(token))
    assert trends.status_code == 200
    t = trends.json()
    assert "income_growth_rate" in t
    assert "expense_growth_rate" in t

    accounts = client.get(f"/workspaces/{slug}/dashboard/accounts", headers=auth_headers(token))
    assert accounts.status_code == 200
    assert len(accounts.json()["items"]) == 1


def test_reports_export_csv_and_xlsx(client: TestClient) -> None:
    token = login(client, "owner-export@example.com")
    slug = _create_workspace(client, token, "Export WS")
    cat_income = _create_category(client, token, slug, "income")
    account_id = _create_account(client, token, slug, initial=0)

    now = datetime.now(timezone.utc)
    _create_tx(client, token, slug, account_id, cat_income, "income", 123, now, "test")

    csv_res = client.get(
        f"/workspaces/{slug}/reports/export/csv",
        params={"start_date": now.isoformat(), "end_date": now.isoformat()},
        headers=auth_headers(token),
    )
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert b"amount_cents" in csv_res.content

    xlsx_res = client.get(
        f"/workspaces/{slug}/reports/export/xlsx",
        params={"start_date": now.isoformat(), "end_date": now.isoformat()},
        headers=auth_headers(token),
    )
    assert xlsx_res.status_code == 200
    assert (
        xlsx_res.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert xlsx_res.content[:2] == b"PK"
