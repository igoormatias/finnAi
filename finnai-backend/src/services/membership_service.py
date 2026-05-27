from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from domain.exceptions import ForbiddenException, MembershipNotFoundException
from domain.workspace_roles import WorkspaceRole, is_admin_role, is_owner_role
from models.user import User
from models.workspace import Workspace
from models.workspace_membership import WorkspaceMembership
from repositories.membership_repository import MembershipRepository


class MembershipService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._memberships = MembershipRepository(session)

    async def list_members(self, workspace: Workspace) -> list[WorkspaceMembership]:
        return await self._memberships.list_members(workspace.id)

    async def update_member_role(
        self,
        workspace: Workspace,
        actor_membership: WorkspaceMembership,
        member_id: uuid.UUID,
        new_role: WorkspaceRole,
    ) -> WorkspaceMembership:
        target = await self._memberships.get_by_id(member_id)
        if target is None or target.workspace_id != workspace.id:
            raise MembershipNotFoundException("Membership not found")

        actor_role = WorkspaceRole(actor_membership.role)
        target_role = WorkspaceRole(target.role)

        if new_role == WorkspaceRole.owner:
            raise ForbiddenException("Cannot assign owner role via this endpoint")

        if is_owner_role(target_role) and not is_owner_role(actor_role):
            raise ForbiddenException("Cannot modify workspace owner")

        if actor_role == WorkspaceRole.admin:
            if target_role in {WorkspaceRole.owner, WorkspaceRole.admin}:
                raise ForbiddenException("Admins cannot modify owner or admin memberships")
            if new_role in {WorkspaceRole.owner, WorkspaceRole.admin}:
                raise ForbiddenException("Admins cannot promote to admin")

        if not is_admin_role(actor_role):
            raise ForbiddenException("Insufficient permissions")

        updated = await self._memberships.update_role(target, new_role.value)
        await self._session.commit()
        return updated

    async def remove_member(
        self,
        workspace: Workspace,
        actor: User,
        actor_membership: WorkspaceMembership,
        member_id: uuid.UUID,
    ) -> None:
        target = await self._memberships.get_by_id(member_id)
        if target is None or target.workspace_id != workspace.id:
            raise MembershipNotFoundException("Membership not found")

        actor_role = WorkspaceRole(actor_membership.role)
        target_role = WorkspaceRole(target.role)

        if not is_admin_role(actor_role):
            raise ForbiddenException("Insufficient permissions")

        if is_owner_role(target_role):
            raise ForbiddenException("Cannot remove workspace owner")

        if target.user_id == actor.id and is_owner_role(actor_role):
            raise ForbiddenException("Owner cannot remove themselves")

        if actor_role == WorkspaceRole.admin and target_role == WorkspaceRole.admin:
            raise ForbiddenException("Admins cannot remove other admins")

        await self._memberships.remove_member(target)
        await self._session.commit()

    async def leave_workspace(
        self,
        workspace: Workspace,
        actor: User,
        actor_membership: WorkspaceMembership,
    ) -> None:
        actor_role = WorkspaceRole(actor_membership.role)
        if is_owner_role(actor_role):
            raise ForbiddenException("Owner cannot leave workspace")
        if actor_membership.user_id != actor.id or actor_membership.workspace_id != workspace.id:
            raise ForbiddenException("Invalid membership context")
        await self._memberships.remove_member(actor_membership)
        await self._session.commit()
