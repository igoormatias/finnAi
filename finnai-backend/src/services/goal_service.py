from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from domain.exceptions import GoalNotFoundException
from domain.goals import GoalPriority, GoalStatus, GoalType
from models.workspace import Workspace
from models.workspace_goal import WorkspaceGoal
from models.workspace_goal_contribution import WorkspaceGoalContribution
from repositories.goal_contribution_repository import GoalContributionRepository
from repositories.goal_repository import GoalRepository
from schemas.goals import GoalsOverviewResponse
from services.ai_stale_helper import mark_ai_score_stale


@dataclass(frozen=True)
class GoalsOverview:
    active_count: int
    completed_count: int
    total_saved_cents: int
    total_progress_percent: float


class GoalService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._goals = GoalRepository(session)
        self._contributions = GoalContributionRepository(session)

    async def list_goals(self, workspace: Workspace) -> list[WorkspaceGoal]:
        return await self._goals.list_by_workspace(workspace.id)

    async def get_overview(self, workspace: Workspace) -> GoalsOverviewResponse:
        goals = await self._goals.list_by_workspace(workspace.id)
        active = [g for g in goals if g.status == GoalStatus.active.value]
        completed = [g for g in goals if g.status == GoalStatus.completed.value]
        total_saved = sum(g.current_amount_cents for g in goals)
        target_sum = sum(g.target_amount_cents for g in active)
        current_sum = sum(g.current_amount_cents for g in active)
        progress = 0.0 if target_sum == 0 else min(100.0, (current_sum / target_sum) * 100.0)
        return GoalsOverviewResponse(
            active_count=len(active),
            completed_count=len(completed),
            total_saved_cents=total_saved,
            total_progress_percent=round(progress, 1),
        )

    async def create_goal(
        self,
        *,
        workspace: Workspace,
        name: str,
        description: str | None,
        goal_type: GoalType,
        target_amount_cents: int,
        current_amount_cents: int,
        target_date,
        priority: GoalPriority,
    ) -> WorkspaceGoal:
        status = GoalStatus.active.value
        completed_at = None
        if current_amount_cents >= target_amount_cents:
            status = GoalStatus.completed.value
            completed_at = datetime.now(timezone.utc)

        goal = await self._goals.create(
            workspace_id=workspace.id,
            name=name.strip(),
            description=description.strip() if description else None,
            goal_type=goal_type.value,
            target_amount_cents=target_amount_cents,
            current_amount_cents=current_amount_cents,
            target_date=target_date,
            priority=priority.value,
            status=status,
        )
        if completed_at:
            goal = await self._goals.update(goal, completed_at=completed_at)
        await self._session.commit()
        await mark_ai_score_stale(self._session, workspace.id)
        return goal

    async def update_goal(
        self,
        *,
        workspace: Workspace,
        goal_id: uuid.UUID,
        name: str | None = None,
        description: str | None = None,
        goal_type: GoalType | None = None,
        target_amount_cents: int | None = None,
        current_amount_cents: int | None = None,
        target_date=None,
        priority: GoalPriority | None = None,
        status: GoalStatus | None = None,
    ) -> WorkspaceGoal:
        goal = await self._get_goal(workspace, goal_id)

        new_current = current_amount_cents if current_amount_cents is not None else goal.current_amount_cents
        new_target = target_amount_cents if target_amount_cents is not None else goal.target_amount_cents
        new_status = status.value if status is not None else goal.status

        completed_at = goal.completed_at
        clear_completed = False
        if new_current >= new_target and new_status != GoalStatus.paused.value:
            new_status = GoalStatus.completed.value
            completed_at = completed_at or datetime.now(timezone.utc)
        elif new_status == GoalStatus.active.value and new_current < new_target:
            clear_completed = True
            completed_at = None

        updated = await self._goals.update(
            goal,
            name=name.strip() if name is not None else None,
            description=description.strip() if description else None,
            goal_type=goal_type.value if goal_type is not None else None,
            target_amount_cents=target_amount_cents,
            current_amount_cents=current_amount_cents,
            target_date=target_date,
            priority=priority.value if priority is not None else None,
            status=new_status,
            completed_at=completed_at,
            clear_completed_at=clear_completed,
        )
        await self._session.commit()
        await mark_ai_score_stale(self._session, workspace.id)
        return updated

    async def add_contribution(
        self,
        *,
        workspace: Workspace,
        goal_id: uuid.UUID,
        amount_cents: int,
        contributed_at: date | None = None,
        notes: str | None = None,
        created_by_user_id: uuid.UUID | None = None,
    ) -> WorkspaceGoal:
        goal = await self._get_goal(workspace, goal_id)
        contribution_date = contributed_at or date.today()
        await self._contributions.create(
            workspace_id=workspace.id,
            goal_id=goal.id,
            amount_cents=amount_cents,
            contributed_at=contribution_date,
            notes=notes.strip() if notes else None,
            created_by_user_id=created_by_user_id,
        )
        new_current = goal.current_amount_cents + amount_cents
        return await self.update_goal(
            workspace=workspace,
            goal_id=goal_id,
            current_amount_cents=new_current,
        )

    async def list_contributions(
        self,
        *,
        workspace: Workspace,
        goal_id: uuid.UUID,
        limit: int = 50,
    ) -> list[WorkspaceGoalContribution]:
        await self._get_goal(workspace, goal_id)
        return await self._contributions.list_by_goal(
            workspace_id=workspace.id,
            goal_id=goal_id,
            limit=limit,
        )

    async def delete_goal(self, *, workspace: Workspace, goal_id: uuid.UUID) -> None:
        goal = await self._get_goal(workspace, goal_id)
        await self._goals.delete(goal)
        await self._session.commit()
        await mark_ai_score_stale(self._session, workspace.id)

    async def _get_goal(self, workspace: Workspace, goal_id: uuid.UUID) -> WorkspaceGoal:
        goal = await self._goals.get_by_id(goal_id)
        if goal is None or goal.workspace_id != workspace.id:
            raise GoalNotFoundException("Goal not found")
        return goal
