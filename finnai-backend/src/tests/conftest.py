from __future__ import annotations

from collections.abc import AsyncGenerator, Generator
from datetime import UTC, datetime, timedelta

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from api.deps import db_session_dep
from api.deps_auth import get_google_verifier
from core.app import create_app
from core.config import clear_settings_cache
from integrations.google.schemas import GoogleTokenInfo
from models.auth_session import AuthSession  # noqa: F401
from models.base import Base
from models.user import User  # noqa: F401

TEST_GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com"
TEST_ACCESS_SECRET = "test-access-secret-key"
TEST_REFRESH_SECRET = "test-refresh-secret-key"


@pytest.fixture(autouse=True)
def _test_environment(monkeypatch: pytest.MonkeyPatch) -> Generator[None, None, None]:
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
    monkeypatch.setenv("DATABASE_URL_SYNC", "sqlite:///:memory:")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", TEST_GOOGLE_CLIENT_ID)
    monkeypatch.setenv("JWT_SECRET_KEY", TEST_ACCESS_SECRET)
    monkeypatch.setenv("JWT_REFRESH_SECRET_KEY", TEST_REFRESH_SECRET)
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
    monkeypatch.setenv("REFRESH_TOKEN_EXPIRE_DAYS", "30")
    clear_settings_cache()
    yield
    clear_settings_cache()


class FakeGoogleTokenVerifier:
    async def verify_id_token(self, id_token: str) -> GoogleTokenInfo:
        if id_token == "invalid-google-token":
            from integrations.google.exceptions import GoogleTokenValidationError

            raise GoogleTokenValidationError("Invalid Google token")

        return GoogleTokenInfo.model_validate(
            {
                "sub": "google-user-123",
                "email": "user@example.com",
                "email_verified": True,
                "name": "Test User",
                "picture": "https://example.com/avatar.png",
                "aud": TEST_GOOGLE_CLIENT_ID,
                "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
            }
        )


@pytest_asyncio.fixture
async def db_session(tmp_path) -> AsyncGenerator[AsyncSession, None]:
    db_path = tmp_path / "test.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}")

    async with engine.begin() as connection:
        # Ensure all model modules are imported before create_all()
        from models import (
            auth_session as _auth_session,  # noqa: F401
            user as _user,  # noqa: F401
        )

        await connection.run_sync(Base.metadata.create_all)

    sessionmaker = async_sessionmaker(engine, expire_on_commit=False)
    async with sessionmaker() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def client(db_session: AsyncSession) -> Generator[TestClient, None, None]:
    async def override_db_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app = create_app()
    app.dependency_overrides[db_session_dep] = override_db_session
    app.dependency_overrides[get_google_verifier] = lambda: FakeGoogleTokenVerifier()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
