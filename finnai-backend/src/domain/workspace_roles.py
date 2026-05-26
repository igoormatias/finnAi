from __future__ import annotations

from enum import StrEnum


class WorkspaceRole(StrEnum):
    owner = "owner"
    admin = "admin"
    member = "member"
    viewer = "viewer"


ADMIN_ROLES = frozenset({WorkspaceRole.owner, WorkspaceRole.admin})
MEMBER_ROLES = frozenset(
    {WorkspaceRole.owner, WorkspaceRole.admin, WorkspaceRole.member, WorkspaceRole.viewer}
)


def is_admin_role(role: WorkspaceRole) -> bool:
    return role in ADMIN_ROLES


def is_owner_role(role: WorkspaceRole) -> bool:
    return role == WorkspaceRole.owner
