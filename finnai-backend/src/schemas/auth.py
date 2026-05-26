from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, Field

from schemas.user import UserResponse


class AuthGoogleRequest(BaseModel):
    id_token: str = Field(min_length=10)


class RefreshTokenRequest(BaseModel):
    pass


class TokenPayload(BaseModel):
    sub: uuid.UUID
    type: Literal["access", "refresh"]
    sid: uuid.UUID | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
