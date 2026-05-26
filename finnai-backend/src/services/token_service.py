from __future__ import annotations

import uuid
from typing import Any

from core.config import Settings
from core.security.jwt import TokenType, create_access_token, create_refresh_token, decode_token
from domain.exceptions import InvalidTokenException
from schemas.auth import TokenPayload


class TokenService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create_access_token(self, user_id: uuid.UUID) -> str:
        return create_access_token(
            user_id=user_id,
            secret=self._settings.jwt_secret_key,
            expires_minutes=self._settings.access_token_expire_minutes,
        )

    def create_refresh_token(self, user_id: uuid.UUID, session_id: uuid.UUID) -> str:
        return create_refresh_token(
            user_id=user_id,
            session_id=session_id,
            secret=self._settings.jwt_refresh_secret_key,
            expires_days=self._settings.refresh_token_expire_days,
        )

    def decode_access_token(self, token: str) -> TokenPayload:
        payload = self._decode(token, TokenType.access)
        return TokenPayload(sub=uuid.UUID(payload["sub"]), type="access")

    def decode_refresh_token(self, token: str) -> TokenPayload:
        payload = self._decode(token, TokenType.refresh)
        sid = payload.get("sid")
        if not sid:
            raise InvalidTokenException("Invalid refresh token")
        return TokenPayload(sub=uuid.UUID(payload["sub"]), type="refresh", sid=uuid.UUID(sid))

    def _decode(self, token: str, expected_type: TokenType) -> dict[str, Any]:
        secret = (
            self._settings.jwt_secret_key
            if expected_type == TokenType.access
            else self._settings.jwt_refresh_secret_key
        )
        return decode_token(token, secret, expected_type)
