from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workspace_goal import WorkspaceGoal


class GoalRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        name: str,
        description: str | None,
        goal_type: str,
        target_amount_cents: int,
        current_amount_cents: int,
        target_date: date | None,
        priority: str,
        status: str,
    ) -> WorkspaceGoal:
        goal = WorkspaceGoal(
            workspace_id=workspace_id,
            name=name,
            description=description,
            goal_type=goal_type,
            target_amount_cents=target_amount_cents,
            current_amount_cents=current_amount_cents,
            target_date=target_date,
            priority=priority,
            status=status,
        )
        self._session.add(goal)
        await self._session.flush()
        await self._session.refresh(goal)
        return goal

    async def get_by_id(self, goal_id: uuid.UUID) -> WorkspaceGoal | None:
        result = await self._session.execute(
            select(WorkspaceGoal).where(WorkspaceGoal.id == goal_id)
        )
        return result.scalar_one_or_none()

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[WorkspaceGoal]:
        result = await self._session.execute(
            select(WorkspaceGoal)
            .where(WorkspaceGoal.workspace_id == workspace_id)
            .order_by(
                WorkspaceGoal.status.asc(),
                WorkspaceGoal.priority.desc(),
                WorkspaceGoal.target_date.asc().nulls_last(),
                WorkspaceGoal.created_at.desc(),
            )
        )
        return list(result.scalars().all())

    async def update(
        self,
        goal: WorkspaceGoal,
        *,
        name: str | None = None,
        description: str | None = None,
        goal_type: str | None = None,
        target_amount_cents: int | None = None,
        current_amount_cents: int | None = None,
        target_date: date | None = None,
        priority: str | None = None,
        status: str | None = None,
        completed_at: datetime | None = None,
        clear_completed_at: bool = False,
    ) -> WorkspaceGoal:
        if name is not None:
            goal.name = name
        if description is not None:
            goal.description = description
        if goal_type is not None:
            goal.goal_type = goal_type
        if target_amount_cents is not None:
            goal.target_amount_cents = target_amount_cents
        if current_amount_cents is not None:
            goal.current_amount_cents = current_amount_cents
        if target_date is not None:
            goal.target_date = target_date
        if priority is not None:
            goal.priority = priority
        if status is not None:
            goal.status = status
        if clear_completed_at:
            goal.completed_at = None
        elif completed_at is not None:
            goal.completed_at = completed_at
        await self._session.flush()
        await self._session.refresh(goal)
        return goal

    async def delete(self, goal: WorkspaceGoal) -> None:
        await self._session.delete(goal)
        await self._session.flush()
