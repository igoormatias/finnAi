from __future__ import annotations

import uuid

from fastapi import APIRouter

from api.deps import DbSessionDep
from api.deps_finance import FinanceWriteDep
from api.deps_workspaces import WorkspaceMemberDep
from domain.goals import GoalPriority, GoalStatus, GoalType
from schemas.goals import (
    GoalContributionCreate,
    GoalContributionResponse,
    GoalCreate,
    GoalResponse,
    GoalsOverviewResponse,
    GoalUpdate,
)
from services.goal_service import GoalService

router = APIRouter(prefix="/workspaces/{slug}/goals", tags=["goals"])


@router.get("", response_model=list[GoalResponse])
async def list_goals(context: WorkspaceMemberDep, session: DbSessionDep) -> list[GoalResponse]:
    goals = await GoalService(session).list_goals(context.workspace)
    return [GoalResponse.model_validate(g) for g in goals]


@router.get("/overview", response_model=GoalsOverviewResponse)
async def goals_overview(
    context: WorkspaceMemberDep, session: DbSessionDep
) -> GoalsOverviewResponse:
    return await GoalService(session).get_overview(context.workspace)


@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(
    body: GoalCreate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> GoalResponse:
    goal = await GoalService(session).create_goal(
        workspace=context.workspace,
        name=body.name,
        description=body.description,
        goal_type=GoalType(body.goal_type),
        target_amount_cents=body.target_amount_cents,
        current_amount_cents=body.current_amount_cents,
        target_date=body.target_date,
        priority=GoalPriority(body.priority),
    )
    return GoalResponse.model_validate(goal)


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    body: GoalUpdate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> GoalResponse:
    payload = body.model_dump(exclude_unset=True)
    goal = await GoalService(session).update_goal(
        workspace=context.workspace,
        goal_id=goal_id,
        name=payload.get("name"),
        description=payload.get("description"),
        goal_type=GoalType(payload["goal_type"]) if "goal_type" in payload else None,
        target_amount_cents=payload.get("target_amount_cents"),
        current_amount_cents=payload.get("current_amount_cents"),
        target_date=payload.get("target_date"),
        priority=GoalPriority(payload["priority"]) if "priority" in payload else None,
        status=GoalStatus(payload["status"]) if "status" in payload else None,
    )
    return GoalResponse.model_validate(goal)


@router.get("/{goal_id}/contributions", response_model=list[GoalContributionResponse])
async def list_contributions(
    goal_id: uuid.UUID,
    context: WorkspaceMemberDep,
    session: DbSessionDep,
) -> list[GoalContributionResponse]:
    contributions = await GoalService(session).list_contributions(
        workspace=context.workspace,
        goal_id=goal_id,
    )
    return [GoalContributionResponse.model_validate(c) for c in contributions]


@router.post("/{goal_id}/contributions", response_model=GoalResponse)
async def add_contribution(
    goal_id: uuid.UUID,
    body: GoalContributionCreate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> GoalResponse:
    goal = await GoalService(session).add_contribution(
        workspace=context.workspace,
        goal_id=goal_id,
        amount_cents=body.amount_cents,
        contributed_at=body.contributed_at,
        notes=body.notes,
        created_by_user_id=context.user.id,
    )
    return GoalResponse.model_validate(goal)


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: uuid.UUID,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> None:
    await GoalService(session).delete_goal(workspace=context.workspace, goal_id=goal_id)
