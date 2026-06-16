from __future__ import annotations

from datetime import datetime, timezone

import pytest

from core.dates import (
    current_month_range_utc,
    iter_period_starts_utc,
    normalize_range_to_utc,
    previous_month_range_utc,
)


def test_normalize_range_to_utc_converts_local_to_utc() -> None:
    start = datetime(2026, 6, 1, 0, 0, 0)
    end = datetime(2026, 6, 15, 23, 59, 59)
    dr = normalize_range_to_utc(start=start, end=end, tz="America/Sao_Paulo")
    assert dr.start.tzinfo == timezone.utc
    assert dr.end.tzinfo == timezone.utc
    assert dr.end >= dr.start


def test_normalize_range_rejects_end_before_start() -> None:
    start = datetime(2026, 6, 10, tzinfo=timezone.utc)
    end = datetime(2026, 6, 1, tzinfo=timezone.utc)
    with pytest.raises(ValueError, match="end_date must be >= start_date"):
        normalize_range_to_utc(start=start, end=end, tz="UTC")


def test_current_month_range_utc_respects_timezone() -> None:
    now = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    dr = current_month_range_utc(now_utc=now, tz="America/Sao_Paulo")
    assert dr.start < dr.end
    assert dr.end == now


def test_previous_month_range_utc_before_current() -> None:
    now = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    cur = current_month_range_utc(now_utc=now, tz="UTC")
    prev = previous_month_range_utc(now_utc=now, tz="UTC")
    assert prev.end < cur.start


def test_iter_period_starts_daily() -> None:
    start = datetime(2026, 6, 1, tzinfo=timezone.utc)
    end = datetime(2026, 6, 3, tzinfo=timezone.utc)
    starts = iter_period_starts_utc(start_utc=start, end_utc=end, granularity="daily", tz="UTC")
    assert len(starts) == 3


def test_iter_period_starts_invalid_granularity() -> None:
    start = datetime(2026, 6, 1, tzinfo=timezone.utc)
    end = datetime(2026, 6, 3, tzinfo=timezone.utc)
    with pytest.raises(ValueError, match="Invalid granularity"):
        iter_period_starts_utc(start_utc=start, end_utc=end, granularity="hourly", tz="UTC")
