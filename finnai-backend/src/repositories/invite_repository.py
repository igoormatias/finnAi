from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workspace_invite import WorkspaceInvite


class InviteRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        invited_email: str,
        role: str,
        invited_by: uuid.UUID,
        token: str,
        expires_at: datetime,
    ) -> WorkspaceInvite:
        invite = WorkspaceInvite(
            workspace_id=workspace_id,
            invited_email=invited_email,
            role=role,
            invited_by=invited_by,
            token=token,
            expires_at=expires_at,
        )
        self._session.add(invite)
        await self._session.flush()
        await self._session.refresh(invite)
        return invite

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[WorkspaceInvite]:
        result = await self._session.execute(
            select(WorkspaceInvite)
            .where(WorkspaceInvite.workspace_id == workspace_id)
            .order_by(WorkspaceInvite.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, invite_id: uuid.UUID) -> WorkspaceInvite | None:
        result = await self._session.execute(
            select(WorkspaceInvite).where(WorkspaceInvite.id == invite_id)
        )
        return result.scalar_one_or_none()

    async def get_by_token(self, token: str) -> WorkspaceInvite | None:
        result = await self._session.execute(
            select(WorkspaceInvite).where(WorkspaceInvite.token == token)
        )
        return result.scalar_one_or_none()

    async def find_active_duplicate(
        self,
        workspace_id: uuid.UUID,
        invited_email: str,
        now: datetime,
    ) -> WorkspaceInvite | None:
        result = await self._session.execute(
            select(WorkspaceInvite).where(
                and_(
                    WorkspaceInvite.workspace_id == workspace_id,
                    WorkspaceInvite.invited_email == invited_email,
                    WorkspaceInvite.accepted_at.is_(None),
                    WorkspaceInvite.expires_at > now,
                )
            )
        )
        return result.scalar_one_or_none()

    async def mark_accepted(
        self, invite: WorkspaceInvite, accepted_at: datetime
    ) -> WorkspaceInvite:
        invite.accepted_at = accepted_at
        await self._session.flush()
        await self._session.refresh(invite)
        return invite

    async def delete(self, invite: WorkspaceInvite) -> None:
        await self._session.delete(invite)
        await self._session.flush()
