from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.user import User
    from models.workspace import Workspace
    from models.workspace_goal import WorkspaceGoal


class WorkspaceGoalContribution(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "workspace_goal_contributions"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    goal_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workspace_goals.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    contributed_at: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    goal: Mapped[WorkspaceGoal] = relationship(lazy="selectin")
    workspace: Mapped[Workspace] = relationship(lazy="selectin")
    created_by: Mapped[User | None] = relationship(lazy="selectin")
