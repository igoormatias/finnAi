from __future__ import annotations

from fastapi import APIRouter

from api.routers.auth import router as auth_router
from api.routers.health import router as health_router
from api.routers.invites import router as invites_router
from api.routers.workspace_invites import router as workspace_invites_router
from api.routers.workspace_members import router as workspace_members_router
from api.routers.workspaces import router as workspaces_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(workspaces_router)
api_router.include_router(workspace_members_router)
api_router.include_router(workspace_invites_router)
api_router.include_router(invites_router)
