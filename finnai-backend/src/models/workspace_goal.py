from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.workspace import Workspace


class WorkspaceGoal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "workspace_goals"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    goal_type: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    target_amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    current_amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(16), index=True, nullable=False, default="active")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    workspace: Mapped[Workspace] = relationship(lazy="selectin")
