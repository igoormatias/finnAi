from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from api.deps import DbSessionDep
from api.deps_workspaces import WorkspaceAdminDep, WorkspaceMemberDep
from schemas.financial_preferences import (
    FinancialPreferencesResponse,
    FinancialPreferencesUpdate,
)
from services.financial_preferences_service import FinancialPreferencesService

router = APIRouter(prefix="/workspaces/{slug}/financial-preferences", tags=["financial-preferences"])


def _get_financial_preferences_service(session: DbSessionDep) -> FinancialPreferencesService:
    return FinancialPreferencesService(session)


FinancialPreferencesServiceDep = Annotated[
    FinancialPreferencesService, Depends(_get_financial_preferences_service)
]


@router.get("", response_model=FinancialPreferencesResponse)
async def get_financial_preferences(
    context: WorkspaceMemberDep,
    service: FinancialPreferencesServiceDep,
) -> FinancialPreferencesResponse:
    return await service.get_response(context.workspace)


@router.patch("", response_model=FinancialPreferencesResponse)
async def update_financial_preferences(
    body: FinancialPreferencesUpdate,
    context: WorkspaceAdminDep,
    service: FinancialPreferencesServiceDep,
) -> FinancialPreferencesResponse:
    return await service.update(context.workspace, body)
