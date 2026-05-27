from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

from jose import JWTError, jwt

from domain.exceptions import InvalidTokenException


class TokenType(str, Enum):
    access = "access"
    refresh = "refresh"


def create_access_token(
    *,
    user_id: uuid.UUID,
    secret: str,
    expires_minutes: int,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": TokenType.access.value,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def create_refresh_token(
    *,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    secret: str,
    expires_days: int,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "sid": str(session_id),
        "type": TokenType.refresh.value,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(days=expires_days),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str, secret: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError as exc:
        raise InvalidTokenException("Invalid or expired token") from exc

    token_type = payload.get("type")
    if token_type != expected_type.value:
        raise InvalidTokenException("Invalid token type")

    if not payload.get("sub"):
        raise InvalidTokenException("Invalid token subject")

    return payload
