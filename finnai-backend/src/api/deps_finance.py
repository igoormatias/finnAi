from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from api.deps_workspaces import WorkspaceContext, WorkspaceMemberDep
from domain.exceptions import ForbiddenException
from domain.workspace_roles import WorkspaceRole


def require_finance_write(context: WorkspaceMemberDep) -> WorkspaceContext:
    if WorkspaceRole(context.membership.role) == WorkspaceRole.viewer:
        raise ForbiddenException("Viewer role is read-only")
    return context


FinanceWriteDep = Annotated[WorkspaceContext, Depends(require_finance_write)]
