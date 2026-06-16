"""workspace financial preferences

Revision ID: 0009_workspace_financial_preferences
Revises: 0008_goal_contributions
Create Date: 2026-06-16

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0009_workspace_financial_preferences"
down_revision = "0008_goal_contributions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "workspace_financial_preferences",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("emergency_reserve_target_months", sa.Integer(), nullable=False, server_default="6"),
        sa.Column(
            "include_future_transactions",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "include_past_transactions",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "include_goals_in_projections",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "include_recurrences_in_projections",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "default_dashboard_period",
            sa.String(length=32),
            nullable=False,
            server_default="this_month",
        ),
        sa.Column(
            "default_reports_period",
            sa.String(length=32),
            nullable=False,
            server_default="last_90_days",
        ),
        sa.Column(
            "default_reports_mode",
            sa.String(length=16),
            nullable=False,
            server_default="historical",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", name="uq_workspace_financial_preferences_workspace_id"),
    )
    op.create_index(
        op.f("ix_workspace_financial_preferences_workspace_id"),
        "workspace_financial_preferences",
        ["workspace_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_workspace_financial_preferences_workspace_id"),
        table_name="workspace_financial_preferences",
    )
    op.drop_table("workspace_financial_preferences")
