"""Normalize database URLs for Render and print shell export statements."""

from __future__ import annotations

import os
import sys
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


def _convert_scheme(url: str, scheme: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme in {"postgres", "postgresql", "postgresql+asyncpg", "postgresql+psycopg"}:
        return urlunparse(parsed._replace(scheme=scheme))
    return url


def _ensure_sslmode(url: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if query.get("sslmode") != "require":
        query["sslmode"] = "require"
    return urlunparse(parsed._replace(query=urlencode(query)))


def _strip_sslmode(url: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query.pop("sslmode", None)
    query.pop("ssl", None)
    return urlunparse(parsed._replace(query=urlencode(query)))


def main() -> int:
    database_url = os.environ.get("DATABASE_URL", "").strip()
    database_url_sync = os.environ.get("DATABASE_URL_SYNC", "").strip()

    if not database_url_sync and database_url:
        database_url_sync = database_url

    if not database_url_sync:
        print(
            "ERROR: DATABASE_URL_SYNC is missing. "
            "Copy the Internal Database URL from Render Postgres Connections.",
            file=sys.stderr,
        )
        return 1

    if database_url:
        database_url = _convert_scheme(database_url, "postgresql+asyncpg")
    else:
        database_url = _convert_scheme(database_url_sync, "postgresql+asyncpg")

    database_url = _strip_sslmode(database_url)

    database_url_sync = _convert_scheme(database_url_sync, "postgresql+psycopg")
    database_url_sync = _ensure_sslmode(database_url_sync)

    host = urlparse(database_url_sync).hostname or ""
    if host in {"", "db", "localhost"}:
        print(
            f"ERROR: invalid database host '{host}'. "
            "Use the Internal Database URL hostname from Render (dpg-...-a).",
            file=sys.stderr,
        )
        return 1

    print(f'export DATABASE_URL="{database_url}"')
    print(f'export DATABASE_URL_SYNC="{database_url_sync}"')
    print(f'echo "Database host: {host}"', file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
