from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from domain.date_presets import resolve_period
from tests.workspaces.helpers import auth_headers, login


def test_resolve_period_last_30_days() -> None:
    now = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    resolved = resolve_period(preset="last_30_days", tz="UTC", now_utc=now)
    assert resolved.granularity == "daily"
    assert resolved.end >= resolved.start


def test_resolve_period_next_30_days() -> None:
    now = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    resolved = resolve_period(preset="next_30_days", tz="UTC", now_utc=now)
    assert (resolved.end - resolved.start).days >= 29


def test_resolve_period_custom_requires_dates() -> None:
    with pytest.raises(ValueError):
        resolve_period(preset="custom", tz="UTC")


def test_financial_preferences_defaults(client: TestClient) -> None:
    token = login(client, "prefs-owner@example.com")
    slug = client.post("/workspaces", json={"name": "Prefs WS"}, headers=auth_headers(token))
    assert slug.status_code == 201
    workspace_slug = slug.json()["slug"]

    res = client.get(
        f"/workspaces/{workspace_slug}/financial-preferences",
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    body = res.json()
    assert body["emergency_reserve_target_months"] == 6
    assert body["default_dashboard_period"] == "this_month"
    assert body["include_recurrences_in_projections"] is True


def test_financial_preferences_patch(client: TestClient) -> None:
    token = login(client, "prefs-admin@example.com")
    created = client.post("/workspaces", json={"name": "Prefs Patch"}, headers=auth_headers(token))
    slug = created.json()["slug"]

    patched = client.patch(
        f"/workspaces/{slug}/financial-preferences",
        json={"emergency_reserve_target_months": 9, "default_reports_mode": "complete"},
        headers=auth_headers(token),
    )
    assert patched.status_code == 200
    assert patched.json()["emergency_reserve_target_months"] == 9
    assert patched.json()["default_reports_mode"] == "complete"
