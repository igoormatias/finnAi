from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from services.ai.ai_cache_service import AIScoreCacheService


async def mark_ai_score_stale(session: AsyncSession, workspace_id: uuid.UUID) -> None:
    cache = AIScoreCacheService(session, get_settings())
    await cache.mark_stale(workspace_id=workspace_id)
