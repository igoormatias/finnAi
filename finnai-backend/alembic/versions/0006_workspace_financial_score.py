"""workspace financial score

Revision ID: 0006_workspace_financial_score
Revises: 0005_workspace_timezone
Create Date: 2026-05-26

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006_workspace_financial_score"
down_revision = "0005_workspace_timezone"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "workspace_financial_scores",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("strengths", sa.JSON(), nullable=False),
        sa.Column("weaknesses", sa.JSON(), nullable=False),
        sa.Column("tips", sa.JSON(), nullable=False),
        sa.Column("badges", sa.JSON(), nullable=False),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("raw_response", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("last_requested_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.String(length=1024), nullable=True),
        sa.Column("provider", sa.String(length=64), nullable=True),
        sa.Column("model", sa.String(length=128), nullable=True),
        sa.Column("is_stale", sa.Boolean(), server_default="true", nullable=False),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["workspaces.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", name="uq_workspace_financial_score_workspace"),
    )
    op.create_index(
        op.f("ix_workspace_financial_scores_workspace_id"),
        "workspace_financial_scores",
        ["workspace_id"],
        unique=True,
    )
    op.create_index(
        op.f("ix_workspace_financial_scores_status"),
        "workspace_financial_scores",
        ["status"],
    )
    op.create_index(
        op.f("ix_workspace_financial_scores_is_stale"),
        "workspace_financial_scores",
        ["is_stale"],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_workspace_financial_scores_is_stale"), table_name="workspace_financial_scores")
    op.drop_index(op.f("ix_workspace_financial_scores_status"), table_name="workspace_financial_scores")
    op.drop_index(op.f("ix_workspace_financial_scores_workspace_id"), table_name="workspace_financial_scores")
    op.drop_table("workspace_financial_scores")

