from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from zoneinfo import ZoneInfo
from zoneinfo import ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

WorkspaceRoleLiteral = Literal["owner", "admin", "member", "viewer"]


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    timezone: str | None = Field(default=None, min_length=1, max_length=64)

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Invalid timezone") from exc
        return value


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    timezone: str
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class MembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    user_id: uuid.UUID
    role: WorkspaceRoleLiteral
    created_at: datetime
    user_email: EmailStr | None = None
    user_name: str | None = None


class MembershipRoleUpdate(BaseModel):
    role: WorkspaceRoleLiteral


class InviteCreate(BaseModel):
    invited_email: EmailStr
    role: WorkspaceRoleLiteral = "member"


class InviteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    invited_email: EmailStr
    role: WorkspaceRoleLiteral
    invited_by: uuid.UUID
    token: str
    expires_at: datetime
    accepted_at: datetime | None
    created_at: datetime
