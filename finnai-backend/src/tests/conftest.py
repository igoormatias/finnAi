from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from core.app import create_app


@pytest.fixture(autouse=True)
def _test_environment() -> Generator[None, None, None]:
    os.environ.setdefault("APP_ENV", "test")
    yield


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client
