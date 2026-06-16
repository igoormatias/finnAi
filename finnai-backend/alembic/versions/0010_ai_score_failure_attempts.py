"""ai score failure attempt counter

Revision ID: 0010_ai_score_retries
Revises: 0009_financial_preferences
Create Date: 2026-06-16

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0010_ai_score_retries"
down_revision = "0009_financial_preferences"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "workspace_financial_scores",
        sa.Column("failure_attempt_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("workspace_financial_scores", "failure_attempt_count")
