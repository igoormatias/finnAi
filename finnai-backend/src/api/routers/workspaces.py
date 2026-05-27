from __future__ import annotations

from fastapi import APIRouter

from api.deps_auth import CurrentUserDep
from api.deps_workspaces import (
    WorkspaceAdminDep,
    WorkspaceMemberDep,
    WorkspaceOwnerDep,
    WorkspaceServiceDep,
)
from schemas.workspaces import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    body: WorkspaceCreate,
    current_user: CurrentUserDep,
    workspace_service: WorkspaceServiceDep,
) -> WorkspaceResponse:
    workspace = await workspace_service.create_workspace(current_user, body.name)
    return WorkspaceResponse.model_validate(workspace)


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(
    current_user: CurrentUserDep,
    workspace_service: WorkspaceServiceDep,
) -> list[WorkspaceResponse]:
    workspaces = await workspace_service.list_workspaces(current_user)
    return [WorkspaceResponse.model_validate(item) for item in workspaces]


@router.get("/{slug}", response_model=WorkspaceResponse)
async def get_workspace(context: WorkspaceMemberDep) -> WorkspaceResponse:
    return WorkspaceResponse.model_validate(context.workspace)


@router.patch("/{slug}", response_model=WorkspaceResponse)
async def update_workspace(
    body: WorkspaceUpdate,
    context: WorkspaceAdminDep,
    workspace_service: WorkspaceServiceDep,
) -> WorkspaceResponse:
    workspace = await workspace_service.update_workspace(
        context.workspace,
        name=body.name,
        timezone=body.timezone,
    )
    return WorkspaceResponse.model_validate(workspace)


@router.delete("/{slug}", status_code=204)
async def delete_workspace(
    context: WorkspaceOwnerDep,
    workspace_service: WorkspaceServiceDep,
) -> None:
    await workspace_service.delete_workspace(context.workspace, context.user)
