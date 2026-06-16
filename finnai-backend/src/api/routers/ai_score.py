from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks

from api.deps import SettingsDep
from api.deps_ai import FinancialScoreServiceDep
from api.deps_finance import FinanceWriteDep
from api.deps_workspaces import WorkspaceMemberDep
from schemas.ai import FinnAIScoreResponse, RegenerateResponse

router = APIRouter(prefix="/workspaces/{slug}/ai", tags=["ai"])


@router.get("/score", response_model=FinnAIScoreResponse)
async def get_score(
    context: WorkspaceMemberDep, service: FinancialScoreServiceDep
) -> FinnAIScoreResponse:
    score = await service.get_score(workspace=context.workspace)
    return FinnAIScoreResponse(
        workspace_id=score.workspace_id,
        score=score.score,
        label=score.label,
        summary=score.summary,
        strengths=list(score.strengths),
        weaknesses=list(score.weaknesses),
        tips=list(score.tips),
        badges=list(score.badges),
        generated_at=score.generated_at,
        status=score.status,
        last_error=score.last_error,
        is_stale=bool(score.is_stale),
        last_requested_at=score.last_requested_at,
    )


@router.post("/regenerate", response_model=RegenerateResponse, status_code=202)
async def regenerate(
    context: FinanceWriteDep,
    service: FinancialScoreServiceDep,
    settings: SettingsDep,
    background_tasks: BackgroundTasks,
) -> RegenerateResponse:
    result = await service.request_regenerate(workspace=context.workspace)
    if not result.debounced and result.generation_epoch is not None:
        if settings.app_env.value == "test" or settings.ai_score_sync:
            await service.run_regeneration_in_session(
                workspace=context.workspace,
                expected_epoch=result.generation_epoch,
            )
        else:
            background_tasks.add_task(
                service.run_regeneration,
                workspace_id=context.workspace.id,
                expected_epoch=result.generation_epoch,
            )
    return RegenerateResponse(
        status=result.status,
        debounced=result.debounced,
        retries_remaining=result.retries_remaining,
    )
