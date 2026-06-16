from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from core.config import get_settings
from models.auth_session import AuthSession  # noqa: F401
from models.account import Account  # noqa: F401
from models.base import Base
from models.category import Category  # noqa: F401
from models.transaction import Transaction  # noqa: F401
from models.user import User  # noqa: F401
from models.workspace import Workspace  # noqa: F401
from models.workspace_financial_score import WorkspaceFinancialScore  # noqa: F401
from models.workspace_invite import WorkspaceInvite  # noqa: F401
from models.workspace_membership import WorkspaceMembership  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    return get_settings().database_url_sync


def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        get_url(),
        poolclass=pool.NullPool,
        connect_args={"connect_timeout": 30},
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

