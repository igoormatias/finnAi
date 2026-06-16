from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query
from fastapi.responses import Response

from api.deps import DbSessionDep
from api.deps_analytics import ExportServiceDep, ReportServiceDep
from api.deps_workspaces import WorkspaceMemberDep
from services.report_service import ExportFilters

router = APIRouter(prefix="/workspaces/{slug}/reports", tags=["reports"])


@router.get("/export/csv")
async def export_csv(
    context: WorkspaceMemberDep,
    report_service: ReportServiceDep,
    export_service: ExportServiceDep,
    session: DbSessionDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    type: Annotated[str | None, Query()] = None,
    category_id: Annotated[str | None, Query()] = None,
    account_id: Annotated[str | None, Query()] = None,
    amount_min_cents: Annotated[int | None, Query(ge=0)] = None,
    amount_max_cents: Annotated[int | None, Query(ge=0)] = None,
    search: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    mode: Annotated[str, Query()] = "historical",
) -> Response:
    rows = await report_service.list_export_rows(
        workspace=context.workspace,
        filters=ExportFilters(
            start_date=start_date,
            end_date=end_date,
            type=type,
            category_id=None if category_id is None else __import__("uuid").UUID(category_id),
            account_id=None if account_id is None else __import__("uuid").UUID(account_id),
            amount_min_cents=amount_min_cents,
            amount_max_cents=amount_max_cents,
            search=search,
            mode=mode,  # type: ignore[arg-type]
        ),
        limit=10_000,
        offset=0,
    )
    export_file = export_service.export_csv(rows=rows, filename_prefix="transactions_export")
    return Response(
        content=export_file.content,
        media_type=export_file.content_type,
        headers={"Content-Disposition": f'attachment; filename="{export_file.filename}"'},
    )


@router.get("/export/xlsx")
async def export_xlsx(
    context: WorkspaceMemberDep,
    report_service: ReportServiceDep,
    export_service: ExportServiceDep,
    start_date: Annotated[datetime, Query()],
    end_date: Annotated[datetime, Query()],
    type: Annotated[str | None, Query()] = None,
    category_id: Annotated[str | None, Query()] = None,
    account_id: Annotated[str | None, Query()] = None,
    amount_min_cents: Annotated[int | None, Query(ge=0)] = None,
    amount_max_cents: Annotated[int | None, Query(ge=0)] = None,
    search: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    mode: Annotated[str, Query()] = "historical",
) -> Response:
    rows = await report_service.list_export_rows(
        workspace=context.workspace,
        filters=ExportFilters(
            start_date=start_date,
            end_date=end_date,
            type=type,
            category_id=None if category_id is None else __import__("uuid").UUID(category_id),
            account_id=None if account_id is None else __import__("uuid").UUID(account_id),
            amount_min_cents=amount_min_cents,
            amount_max_cents=amount_max_cents,
            search=search,
            mode=mode,  # type: ignore[arg-type]
        ),
        limit=10_000,
        offset=0,
    )
    export_file = export_service.export_xlsx(rows=rows, filename_prefix="transactions_export")
    return Response(
        content=export_file.content,
        media_type=export_file.content_type,
        headers={"Content-Disposition": f'attachment; filename="{export_file.filename}"'},
    )
