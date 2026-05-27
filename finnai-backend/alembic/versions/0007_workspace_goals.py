"""workspace goals

Revision ID: 0007_workspace_goals
Revises: 0006_workspace_financial_score
Create Date: 2026-05-27

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0007_workspace_goals"
down_revision = "0006_workspace_financial_score"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "workspace_goals",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("goal_type", sa.String(length=32), nullable=False),
        sa.Column("target_amount_cents", sa.BigInteger(), nullable=False),
        sa.Column("current_amount_cents", sa.BigInteger(), nullable=False),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("priority", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
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
    )
    op.create_index(
        op.f("ix_workspace_goals_workspace_id"), "workspace_goals", ["workspace_id"]
    )
    op.create_index(op.f("ix_workspace_goals_goal_type"), "workspace_goals", ["goal_type"])
    op.create_index(op.f("ix_workspace_goals_status"), "workspace_goals", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_workspace_goals_status"), table_name="workspace_goals")
    op.drop_index(op.f("ix_workspace_goals_goal_type"), table_name="workspace_goals")
    op.drop_index(op.f("ix_workspace_goals_workspace_id"), table_name="workspace_goals")
    op.drop_table("workspace_goals")
