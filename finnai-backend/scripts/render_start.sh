#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH=src

if ! eval "$(python3 scripts/render_env.py)"; then
  exit 1
fi

alembic upgrade head
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
