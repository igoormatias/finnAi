from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from api.deps import DbSessionDep, SettingsDep
from domain.ai.types import AIProviderName
from integrations.ai.base import AIProvider
from integrations.ai.gemini_provider import GeminiProvider
from services.ai.financial_score_service import FinancialScoreService


def get_ai_provider(settings: SettingsDep) -> AIProvider:
    provider = settings.ai_provider
    if provider == AIProviderName.gemini.value:
        return GeminiProvider(settings)
    raise ValueError("Unsupported AI provider")


def get_financial_score_service(
    session: DbSessionDep,
    settings: SettingsDep,
    provider: Annotated[AIProvider, Depends(get_ai_provider)],
) -> FinancialScoreService:
    return FinancialScoreService(session, settings, provider)


AIProviderDep = Annotated[AIProvider, Depends(get_ai_provider)]
FinancialScoreServiceDep = Annotated[FinancialScoreService, Depends(get_financial_score_service)]
