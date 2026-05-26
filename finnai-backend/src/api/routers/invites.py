from __future__ import annotations

from fastapi import APIRouter

from api.deps_auth import CurrentUserDep
from api.deps_workspaces import InviteServiceDep
from schemas.workspaces import MembershipResponse

router = APIRouter(prefix="/invites", tags=["invites"])


@router.post("/{token}/accept", response_model=MembershipResponse)
async def accept_invite(
    token: str,
    current_user: CurrentUserDep,
    invite_service: InviteServiceDep,
) -> MembershipResponse:
    membership = await invite_service.accept_invite(current_user, token)
    return MembershipResponse(
        id=membership.id,
        workspace_id=membership.workspace_id,
        user_id=membership.user_id,
        role=membership.role,
        created_at=membership.created_at,
        user_email=current_user.email,
        user_name=current_user.name,
    )
