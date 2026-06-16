"""ai score generation epoch

Revision ID: 0011_ai_score_epoch
Revises: 0010_ai_score_retries
Create Date: 2026-06-16

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0011_ai_score_epoch"
down_revision = "0010_ai_score_retries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "workspace_financial_scores",
        sa.Column("generation_epoch", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("workspace_financial_scores", "generation_epoch")
