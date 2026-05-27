from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

try:
    from enum import StrEnum  # type: ignore[attr-defined]

    class AppEnvironment(StrEnum):
        development = "development"
        test = "test"
        production = "production"

except ImportError:

    class AppEnvironment(str, Enum):
        development = "development"
        test = "test"
        production = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FinnAI API"
    app_env: AppEnvironment = Field(default=AppEnvironment.development, validation_alias="APP_ENV")
    debug: bool = Field(default=False, validation_alias="DEBUG")

    database_url: str = Field(
        default="postgresql+asyncpg://finnai:finnai@localhost:5432/finnai",
        validation_alias="DATABASE_URL",
    )
    database_url_sync: str = Field(
        default="postgresql+psycopg://finnai:finnai@localhost:5432/finnai",
        validation_alias="DATABASE_URL_SYNC",
    )

    redis_url: str | None = Field(default=None, validation_alias="REDIS_URL")
    celery_broker_url: str | None = Field(default=None, validation_alias="CELERY_BROKER_URL")

    google_client_id: str = Field(
        default="",
        validation_alias="GOOGLE_CLIENT_ID",
    )
    jwt_secret_key: str = Field(
        default="change-me-access-secret",
        validation_alias="JWT_SECRET_KEY",
    )
    jwt_refresh_secret_key: str = Field(
        default="change-me-refresh-secret",
        validation_alias="JWT_REFRESH_SECRET_KEY",
    )
    access_token_expire_minutes: int = Field(
        default=15,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    refresh_token_expire_days: int = Field(
        default=30,
        validation_alias="REFRESH_TOKEN_EXPIRE_DAYS",
    )
    auth_cookie_name: str = Field(default="refresh_token", validation_alias="AUTH_COOKIE_NAME")
    auth_cookie_secure: bool = Field(default=False, validation_alias="AUTH_COOKIE_SECURE")
    auth_cookie_samesite: str = Field(default="lax", validation_alias="AUTH_COOKIE_SAMESITE")
    auth_cookie_domain: str | None = Field(default=None, validation_alias="AUTH_COOKIE_DOMAIN")
    invite_expire_days: int = Field(default=7, validation_alias="INVITE_EXPIRE_DAYS")

    ai_provider: str = Field(default="gemini", validation_alias="AI_PROVIDER")
    ai_model: str | None = Field(default=None, validation_alias="AI_MODEL")
    gemini_api_key: str | None = Field(default=None, validation_alias="GEMINI_API_KEY")
    gemini_model: str | None = Field(default=None, validation_alias="GEMINI_MODEL")
    ai_score_debounce_seconds: int = Field(
        default=600, validation_alias="AI_SCORE_DEBOUNCE_SECONDS"
    )
    ai_score_sync: bool = Field(default=False, validation_alias="AI_SCORE_SYNC")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.app_env == AppEnvironment.production:
        settings.debug = False
        settings.auth_cookie_secure = True
    elif settings.app_env == AppEnvironment.development:
        settings.ai_score_debounce_seconds = min(settings.ai_score_debounce_seconds, 60)
    return settings


def clear_settings_cache() -> None:
    get_settings.cache_clear()
