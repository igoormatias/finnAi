from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from models.workspace import Workspace


class WorkspaceFinancialPreferences(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "workspace_financial_preferences"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
        unique=True,
        nullable=False,
    )
    emergency_reserve_target_months: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    include_future_transactions: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    include_past_transactions: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    include_goals_in_projections: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    include_recurrences_in_projections: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )
    default_dashboard_period: Mapped[str] = mapped_column(
        String(32), nullable=False, default="this_month"
    )
    default_reports_period: Mapped[str] = mapped_column(
        String(32), nullable=False, default="last_90_days"
    )
    default_reports_mode: Mapped[str] = mapped_column(
        String(16), nullable=False, default="historical"
    )

    workspace: Mapped[Workspace] = relationship(lazy="selectin")
