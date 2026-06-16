from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from tests.analytics.test_dashboard_v5 import (
    _create_account,
    _create_category,
    _create_tx,
    _create_workspace,
)
from tests.workspaces.helpers import auth_headers, login


def test_projected_cashflow_endpoint(client: TestClient) -> None:
    token = login(client, "projection-owner@example.com")
    slug = _create_workspace(client, token, "Projection WS")
    cat_expense = _create_category(client, token, slug, "expense")
    account_id = _create_account(client, token, slug)

    future = datetime.now(timezone.utc) + timedelta(days=5)
    _create_tx(client, token, slug, account_id, cat_expense, "expense", 1500, future, "future bill")

    now = datetime.now(timezone.utc)
    res = client.get(
        f"/workspaces/{slug}/dashboard/cashflow/projected",
        params={
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=30)).isoformat(),
            "granularity": "daily",
        },
        headers=auth_headers(token),
    )
    assert res.status_code == 200
    body = res.json()
    assert "points" in body
    assert body["projected_expense_cents"] >= 1500


@pytest.mark.asyncio
async def test_recurring_monthly_burn() -> None:
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from models.base import Base
    from services.projection_service import ProjectionService

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        from models import account, category, transaction, user, workspace  # noqa: F401

        await conn.run_sync(Base.metadata.create_all)

    sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
    async with sessionmaker() as session:
        service = ProjectionService(session)
        burn = await service.recurring_monthly_burn_cents(
            workspace_id=__import__("uuid").uuid4()
        )
        assert burn == 0

    await engine.dispose()
