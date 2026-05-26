from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Path

from api.deps import DbSessionDep, SettingsDep
from api.deps_auth import CurrentUserDep
from domain.exceptions import ForbiddenException, WorkspaceNotFoundException
from domain.workspace_roles import WorkspaceRole, is_admin_role, is_owner_role
from models.user import User
from models.workspace import Workspace
from models.workspace_membership import WorkspaceMembership
from repositories.membership_repository import MembershipRepository
from repositories.workspace_repository import WorkspaceRepository
from services.invite_service import InviteService
from services.membership_service import MembershipService
from services.workspace_service import WorkspaceService


@dataclass(frozen=True)
class WorkspaceContext:
    workspace: Workspace
    membership: WorkspaceMembership
    user: User


async def _load_workspace_context(
    slug: str,
    user: User,
    session: DbSessionDep,
) -> WorkspaceContext:
    workspace = await WorkspaceRepository(session).get_by_slug(slug)
    if workspace is None:
        raise WorkspaceNotFoundException("Workspace not found")

    membership = await MembershipRepository(session).get_member(workspace.id, user.id)
    if membership is None:
        raise ForbiddenException("Not a workspace member")

    return WorkspaceContext(workspace=workspace, membership=membership, user=user)


async def require_workspace_member(
    slug: Annotated[str, Path()],
    user: CurrentUserDep,
    session: DbSessionDep,
) -> WorkspaceContext:
    return await _load_workspace_context(slug, user, session)


async def require_workspace_admin(
    slug: Annotated[str, Path()],
    user: CurrentUserDep,
    session: DbSessionDep,
) -> WorkspaceContext:
    context = await _load_workspace_context(slug, user, session)
    if not is_admin_role(WorkspaceRole(context.membership.role)):
        raise ForbiddenException("Admin access required")
    return context


async def require_workspace_owner(
    slug: Annotated[str, Path()],
    user: CurrentUserDep,
    session: DbSessionDep,
) -> WorkspaceContext:
    context = await _load_workspace_context(slug, user, session)
    if not is_owner_role(WorkspaceRole(context.membership.role)):
        raise ForbiddenException("Owner access required")
    return context


def get_workspace_service(session: DbSessionDep) -> WorkspaceService:
    return WorkspaceService(session)


def get_membership_service(session: DbSessionDep) -> MembershipService:
    return MembershipService(session)


def get_invite_service(session: DbSessionDep, settings: SettingsDep) -> InviteService:
    return InviteService(session, settings)


WorkspaceMemberDep = Annotated[WorkspaceContext, Depends(require_workspace_member)]
WorkspaceAdminDep = Annotated[WorkspaceContext, Depends(require_workspace_admin)]
WorkspaceOwnerDep = Annotated[WorkspaceContext, Depends(require_workspace_owner)]
WorkspaceServiceDep = Annotated[WorkspaceService, Depends(get_workspace_service)]
MembershipServiceDep = Annotated[MembershipService, Depends(get_membership_service)]
InviteServiceDep = Annotated[InviteService, Depends(get_invite_service)]
