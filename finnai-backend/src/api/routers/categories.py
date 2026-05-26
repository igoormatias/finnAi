from __future__ import annotations

import uuid

from fastapi import APIRouter

from api.deps import DbSessionDep
from api.deps_finance import FinanceWriteDep
from api.deps_workspaces import WorkspaceMemberDep
from domain.finance import CategoryType
from schemas.finance import CategoryCreate, CategoryResponse, CategoryUpdate
from services.category_service import CategoryService

router = APIRouter(prefix="/workspaces/{slug}/categories", tags=["categories"])


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    body: CategoryCreate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> CategoryResponse:
    category = await CategoryService(session).create_category(
        workspace=context.workspace,
        name=body.name,
        type=CategoryType(body.type),
        color=body.color,
        icon=body.icon,
        is_fixed=body.is_fixed,
    )
    return CategoryResponse.model_validate(category)


@router.get("", response_model=list[CategoryResponse])
async def list_categories(
    context: WorkspaceMemberDep, session: DbSessionDep
) -> list[CategoryResponse]:
    categories = await CategoryService(session).list_categories(context.workspace)
    return [CategoryResponse.model_validate(item) for item in categories]


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    body: CategoryUpdate,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> CategoryResponse:
    category = await CategoryService(session).update_category(
        workspace=context.workspace,
        category_id=category_id,
        name=body.name,
        color=body.color,
        icon=body.icon,
        is_fixed=body.is_fixed,
    )
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: uuid.UUID,
    context: FinanceWriteDep,
    session: DbSessionDep,
) -> None:
    await CategoryService(session).delete_category(
        workspace=context.workspace, category_id=category_id
    )
