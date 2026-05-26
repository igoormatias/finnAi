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


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.app_env == AppEnvironment.production:
        settings.debug = False
    return settings
