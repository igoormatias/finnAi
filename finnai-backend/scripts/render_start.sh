#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH=src

echo "==> Preparing database environment..."
if ! eval "$(python3 scripts/render_env.py)"; then
  exit 1
fi

echo "==> Running alembic migrations..."
alembic upgrade head

echo "==> Starting API on port ${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
