from __future__ import annotations

import uuid

from fastapi import APIRouter

from api.deps_workspaces import InviteServiceDep, WorkspaceAdminDep
from domain.workspace_roles import WorkspaceRole
from schemas.workspaces import InviteCreate, InviteResponse

router = APIRouter(prefix="/workspaces/{slug}/invites", tags=["workspace-invites"])


@router.post("", response_model=InviteResponse, status_code=201)
async def create_invite(
    body: InviteCreate,
    context: WorkspaceAdminDep,
    invite_service: InviteServiceDep,
) -> InviteResponse:
    invite_service.assert_can_manage_invites(context.membership)
    invite = await invite_service.create_invite(
        context.workspace,
        context.user,
        body.invited_email,
        WorkspaceRole(body.role),
    )
    return InviteResponse.model_validate(invite)


@router.get("", response_model=list[InviteResponse])
async def list_invites(
    context: WorkspaceAdminDep,
    invite_service: InviteServiceDep,
) -> list[InviteResponse]:
    invite_service.assert_can_manage_invites(context.membership)
    invites = await invite_service.list_invites(context.workspace)
    return [InviteResponse.model_validate(item) for item in invites]


@router.delete("/{invite_id}", status_code=204)
async def delete_invite(
    invite_id: uuid.UUID,
    context: WorkspaceAdminDep,
    invite_service: InviteServiceDep,
) -> None:
    invite_service.assert_can_manage_invites(context.membership)
    await invite_service.delete_invite(context.workspace, invite_id)
