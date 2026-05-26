from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from core.dates import normalize_range_to_utc
from models.workspace import Workspace
from repositories.report_repository import ReportRepository


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


class ReportService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._reports = ReportRepository(session)

    async def list_export_rows(
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
