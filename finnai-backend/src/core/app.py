from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.router import api_router
from core.config import get_settings
from core.database import close_db, init_db


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await init_db()
        yield
        await close_db()

    app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
    app.include_router(api_router)
    return app
