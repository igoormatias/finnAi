from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from api.deps import DbSessionDep
from core.cache.base import AnalyticsCache, NoopCache
from services.analytics_service import AnalyticsService
from services.dashboard_service import DashboardService
from services.export_service import ExportService
from services.report_service import ReportService


def get_analytics_cache() -> AnalyticsCache:
    return NoopCache()


def get_dashboard_service(
    session: DbSessionDep, cache: Annotated[AnalyticsCache, Depends(get_analytics_cache)]
) -> DashboardService:
    return DashboardService(session, cache)


def get_analytics_service(
    session: DbSessionDep, cache: Annotated[AnalyticsCache, Depends(get_analytics_cache)]
) -> AnalyticsService:
    return AnalyticsService(session, cache)


def get_report_service(session: DbSessionDep) -> ReportService:
    return ReportService(session)


def get_export_service() -> ExportService:
    return ExportService()


DashboardServiceDep = Annotated[DashboardService, Depends(get_dashboard_service)]
AnalyticsServiceDep = Annotated[AnalyticsService, Depends(get_analytics_service)]
ReportServiceDep = Annotated[ReportService, Depends(get_report_service)]
ExportServiceDep = Annotated[ExportService, Depends(get_export_service)]
