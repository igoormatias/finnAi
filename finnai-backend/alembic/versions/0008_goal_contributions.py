"""workspace goal contributions

Revision ID: 0008_goal_contributions
Revises: 0007_workspace_goals
Create Date: 2026-06-16

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0008_goal_contributions"
down_revision = "0007_workspace_goals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "workspace_goal_contributions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("goal_id", sa.Uuid(), nullable=False),
        sa.Column("amount_cents", sa.BigInteger(), nullable=False),
        sa.Column("contributed_at", sa.Date(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by_user_id", sa.Uuid(), nullable=True),
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
            ["goal_id"],
            ["workspace_goals.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("amount_cents > 0", name="ck_goal_contributions_amount_positive"),
    )
    op.create_index(
        op.f("ix_workspace_goal_contributions_workspace_id"),
        "workspace_goal_contributions",
        ["workspace_id"],
    )
    op.create_index(
        op.f("ix_workspace_goal_contributions_goal_id"),
        "workspace_goal_contributions",
        ["goal_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_workspace_goal_contributions_goal_id"),
        table_name="workspace_goal_contributions",
    )
    op.drop_index(
        op.f("ix_workspace_goal_contributions_workspace_id"),
        table_name="workspace_goal_contributions",
    )
    op.drop_table("workspace_goal_contributions")
