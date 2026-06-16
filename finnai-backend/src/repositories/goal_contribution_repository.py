from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workspace_goal_contribution import WorkspaceGoalContribution


class GoalContributionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        goal_id: uuid.UUID,
        amount_cents: int,
        contributed_at: date,
        notes: str | None,
        created_by_user_id: uuid.UUID | None,
    ) -> WorkspaceGoalContribution:
        contribution = WorkspaceGoalContribution(
            workspace_id=workspace_id,
            goal_id=goal_id,
            amount_cents=amount_cents,
            contributed_at=contributed_at,
            notes=notes,
            created_by_user_id=created_by_user_id,
        )
        self._session.add(contribution)
        await self._session.flush()
        await self._session.refresh(contribution)
        return contribution

    async def list_by_goal(
        self,
        *,
        workspace_id: uuid.UUID,
        goal_id: uuid.UUID,
        limit: int = 50,
    ) -> list[WorkspaceGoalContribution]:
        result = await self._session.execute(
            select(WorkspaceGoalContribution)
            .where(
                WorkspaceGoalContribution.workspace_id == workspace_id,
                WorkspaceGoalContribution.goal_id == goal_id,
            )
            .order_by(
                WorkspaceGoalContribution.contributed_at.desc(),
                WorkspaceGoalContribution.created_at.desc(),
            )
            .limit(limit)
        )
        return list(result.scalars().all())
