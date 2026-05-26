from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from domain.exceptions import (
    DuplicateInviteException,
    ForbiddenException,
    InviteAlreadyAcceptedException,
    InviteEmailMismatchException,
    InviteExpiredException,
    InviteNotFoundException,
)
from domain.workspace_roles import WorkspaceRole, is_admin_role
from models.user import User
from models.workspace import Workspace
from models.workspace_invite import WorkspaceInvite
from models.workspace_membership import WorkspaceMembership
from repositories.invite_repository import InviteRepository
from repositories.membership_repository import MembershipRepository
from repositories.user_repository import UserRepository


class InviteService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings
        self._invites = InviteRepository(session)
        self._memberships = MembershipRepository(session)
        self._users = UserRepository(session)

    async def create_invite(
        self,
        workspace: Workspace,
        inviter: User,
        invited_email: str,
        role: WorkspaceRole,
    ) -> WorkspaceInvite:
        if role == WorkspaceRole.owner:
            raise ForbiddenException("Cannot invite with owner role")

        now = datetime.now(UTC)
        normalized_email = invited_email.lower().strip()

        duplicate = await self._invites.find_active_duplicate(workspace.id, normalized_email, now)
        if duplicate is not None:
            raise DuplicateInviteException("An active invite already exists for this email")

        existing_user = await self._users.get_by_email(normalized_email)
        if existing_user is not None:
            existing_membership = await self._memberships.get_member(workspace.id, existing_user.id)
            if existing_membership is not None:
                raise DuplicateInviteException("User is already a workspace member")

        token = secrets.token_urlsafe(32)
        expires_at = now + timedelta(days=self._settings.invite_expire_days)

        invite = await self._invites.create(
            workspace_id=workspace.id,
            invited_email=normalized_email,
            role=role.value,
            invited_by=inviter.id,
            token=token,
            expires_at=expires_at,
        )
        await self._session.commit()
        return invite

    async def list_invites(self, workspace: Workspace) -> list[WorkspaceInvite]:
        return await self._invites.list_by_workspace(workspace.id)

    async def delete_invite(
        self,
        workspace: Workspace,
        invite_id: uuid.UUID,
    ) -> None:
        invite = await self._invites.get_by_id(invite_id)
        if invite is None or invite.workspace_id != workspace.id:
            raise InviteNotFoundException("Invite not found")
        if invite.accepted_at is not None:
            raise InviteAlreadyAcceptedException("Invite already accepted")
        await self._invites.delete(invite)
        await self._session.commit()

    async def accept_invite(self, user: User, token: str) -> WorkspaceMembership:
        invite = await self._invites.get_by_token(token)
        if invite is None:
            raise InviteNotFoundException("Invite not found")

        if invite.accepted_at is not None:
            raise InviteAlreadyAcceptedException("Invite already accepted")

        now = datetime.now(UTC)
        expires_at = invite.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at <= now:
            raise InviteExpiredException("Invite has expired")

        if user.email.lower() != invite.invited_email.lower():
            raise InviteEmailMismatchException("Invite email does not match authenticated user")

        existing = await self._memberships.get_member(invite.workspace_id, user.id)
        if existing is not None:
            raise DuplicateInviteException("User is already a workspace member")

        invite_role = WorkspaceRole(invite.role)
        if invite_role == WorkspaceRole.owner:
            raise ForbiddenException("Invalid invite role")

        membership = await self._memberships.add_member(
            workspace_id=invite.workspace_id,
            user_id=user.id,
            role=invite_role.value,
        )
        await self._invites.mark_accepted(invite, now)
        await self._session.commit()
        return membership

    def assert_can_manage_invites(self, membership: WorkspaceMembership) -> None:
        if not is_admin_role(WorkspaceRole(membership.role)):
            raise ForbiddenException("Insufficient permissions")
