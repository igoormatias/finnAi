from __future__ import annotations

from pydantic import BaseModel, Field


class GoogleTokenInfo(BaseModel):
    sub: str = Field(alias="sub")
    email: str
    email_verified: bool | str = False
    name: str | None = None
    picture: str | None = None
    aud: str
    exp: int

    model_config = {"populate_by_name": True}
