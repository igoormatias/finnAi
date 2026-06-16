from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from core.dates import normalize_range_to_utc
from domain.date_presets import ReportMode
from models.workspace import Workspace
from repositories.report_repository import ReportRepository
from services.projection_service import ProjectionService


@dataclass(frozen=True)
class ExportFilters:
    start_date: datetime
    end_date: datetime
    type: str | None
    category_id: uuid.UUID | None
    account_id: uuid.UUID | None
    amount_min_cents: int | None
    amount_max_cents: int | None
    search: str | None
    mode: ReportMode = "historical"


class ReportService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._reports = ReportRepository(session)
        self._projection = ProjectionService(session)

    async def list_export_rows(
        self,
        *,
        workspace: Workspace,
        filters: ExportFilters,
        limit: int,
        offset: int,
    ):
        if filters.mode == "historical":
            return await self._list_historical_rows(workspace=workspace, filters=filters, limit=limit, offset=offset)
        return await self._list_projected_dict_rows(workspace=workspace, filters=filters, limit=limit, offset=offset)

    async def _list_historical_rows(
        self,
        *,
        workspace: Workspace,
        filters: ExportFilters,
        limit: int,
        offset: int,
    ):
        tz = workspace.timezone or "UTC"
        dr = normalize_range_to_utc(start=filters.start_date, end=filters.end_date, tz=tz)
        return await self._reports.list_transactions_for_export(
            workspace_id=workspace.id,
            start_date=dr.start,
            end_date=dr.end,
            type=filters.type,
            category_id=filters.category_id,
            account_id=filters.account_id,
            amount_min_cents=filters.amount_min_cents,
            amount_max_cents=filters.amount_max_cents,
            search=filters.search,
            limit=limit,
            offset=offset,
        )

    async def _list_projected_dict_rows(
        self,
        *,
        workspace: Workspace,
        filters: ExportFilters,
        limit: int,
        offset: int,
    ):
        tz = workspace.timezone or "UTC"
        dr = normalize_range_to_utc(start=filters.start_date, end=filters.end_date, tz=tz)
        result = await self._projection.projected_cashflow(
            workspace=workspace,
            start_date=dr.start,
            end_date=dr.end,
            granularity="daily",
            mode=filters.mode,
        )
        rows = []
        for point in result.points:
            if point.income_cents > 0:
                rows.append(
                    {
                        "transaction_date": point.bucket_start,
                        "type": "income",
                        "amount_cents": point.income_cents,
                        "description": "Projeção agregada",
                        "notes": "",
                        "account_name": "",
                        "category_name": "",
                        "is_projected": point.is_projected,
                    }
                )
            if point.expense_cents > 0:
                rows.append(
                    {
                        "transaction_date": point.bucket_start,
                        "type": "expense",
                        "amount_cents": point.expense_cents,
                        "description": "Projeção agregada",
                        "notes": "",
                        "account_name": "",
                        "category_name": "",
                        "is_projected": point.is_projected,
                    }
                )
        return rows[offset : offset + limit]
