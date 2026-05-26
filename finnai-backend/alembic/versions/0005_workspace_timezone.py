"""workspace timezone

Revision ID: 0005_workspace_timezone
Revises: 0004_financial_core
Create Date: 2026-05-26

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0005_workspace_timezone"
down_revision = "0004_financial_core"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "workspaces",
        sa.Column("timezone", sa.String(length=64), server_default="UTC", nullable=False),
    )
    op.alter_column("workspaces", "timezone", server_default=None)


def downgrade() -> None:
    op.drop_column("workspaces", "timezone")

