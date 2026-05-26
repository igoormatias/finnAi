from __future__ import annotations

import uuid

from fastapi import APIRouter

from api.deps_workspaces import MembershipServiceDep, WorkspaceAdminDep, WorkspaceMemberDep
from domain.workspace_roles import WorkspaceRole
from schemas.workspaces import MembershipResponse, MembershipRoleUpdate

router = APIRouter(prefix="/workspaces/{slug}/members", tags=["workspace-members"])


def _to_membership_response(membership) -> MembershipResponse:
    return MembershipResponse(
        id=membership.id,
        workspace_id=membership.workspace_id,
        user_id=membership.user_id,
        role=membership.role,
        created_at=membership.created_at,
        user_email=getattr(membership.user, "email", None),
        user_name=getattr(membership.user, "name", None),
    )


@router.get("", response_model=list[MembershipResponse])
async def list_members(
    context: WorkspaceMemberDep,
    membership_service: MembershipServiceDep,
) -> list[MembershipResponse]:
    members = await membership_service.list_members(context.workspace)
    return [_to_membership_response(item) for item in members]


@router.patch("/{member_id}", response_model=MembershipResponse)
async def update_member_role(
    member_id: uuid.UUID,
    body: MembershipRoleUpdate,
    context: WorkspaceAdminDep,
    membership_service: MembershipServiceDep,
) -> MembershipResponse:
    updated = await membership_service.update_member_role(
        context.workspace,
        context.membership,
        member_id,
        WorkspaceRole(body.role),
    )
    return _to_membership_response(updated)


@router.delete("/{member_id}", status_code=204)
async def remove_member(
    member_id: uuid.UUID,
    context: WorkspaceAdminDep,
    membership_service: MembershipServiceDep,
) -> None:
    await membership_service.remove_member(
        context.workspace,
        context.user,
        context.membership,
        member_id,
    )
