from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Literal

from core.dates import DateRange, get_zoneinfo, normalize_range_to_utc

PeriodPreset = Literal[
    "7d",
    "30d",
    "1y",
    "last_30_days",
    "last_90_days",
    "this_month",
    "next_30_days",
    "next_90_days",
    "this_year",
    "custom",
]

ReportMode = Literal["historical", "projected", "complete"]


@dataclass(frozen=True)
class ResolvedPeriod:
    preset: PeriodPreset
    start: datetime
    end: datetime
    granularity: str


def _now_local(tz: str, now_utc: datetime | None = None) -> datetime:
    now = now_utc or datetime.now(timezone.utc)
    return now.astimezone(get_zoneinfo(tz))


def resolve_period(
    *,
    preset: PeriodPreset,
    tz: str,
    now_utc: datetime | None = None,
    custom_start: datetime | None = None,
    custom_end: datetime | None = None,
) -> ResolvedPeriod:
    now = now_utc or datetime.now(timezone.utc)
    zone = get_zoneinfo(tz)
    local_now = _now_local(tz, now)

    if preset == "custom":
        if custom_start is None or custom_end is None:
            raise ValueError("custom preset requires custom_start and custom_end")
        dr = normalize_range_to_utc(start=custom_start, end=custom_end, tz=tz)
        return ResolvedPeriod(
            preset=preset,
            start=dr.start,
            end=dr.end,
            granularity=_granularity_for_range(dr.start, dr.end),
        )

    if preset == "7d":
        start_local = datetime(
            local_now.year, local_now.month, local_now.day, tzinfo=zone
        ) - timedelta(days=6)
        end_local = local_now
        granularity = "daily"
    elif preset in ("30d", "this_month"):
        start_local = datetime(local_now.year, local_now.month, 1, tzinfo=zone)
        end_local = local_now
        granularity = "weekly"
    elif preset == "last_30_days":
        start_local = datetime(
            local_now.year, local_now.month, local_now.day, tzinfo=zone
        ) - timedelta(days=29)
        end_local = local_now
        granularity = "daily"
    elif preset == "last_90_days":
        start_local = datetime(
            local_now.year, local_now.month, local_now.day, tzinfo=zone
        ) - timedelta(days=89)
        end_local = local_now
        granularity = "weekly"
    elif preset == "1y":
        start_local = local_now - timedelta(days=365)
        end_local = local_now
        granularity = "monthly"
    elif preset == "next_30_days":
        start_local = datetime(local_now.year, local_now.month, local_now.day, tzinfo=zone)
        end_local = start_local + timedelta(days=30)
        granularity = "daily"
    elif preset == "next_90_days":
        start_local = datetime(local_now.year, local_now.month, local_now.day, tzinfo=zone)
        end_local = start_local + timedelta(days=90)
        granularity = "weekly"
    elif preset == "this_year":
        start_local = datetime(local_now.year, 1, 1, tzinfo=zone)
        end_local = datetime(local_now.year, 12, 31, 23, 59, 59, tzinfo=zone)
        granularity = "monthly"
    else:
        raise ValueError(f"Unknown preset: {preset}")

    dr = normalize_range_to_utc(start=start_local, end=end_local, tz=tz)
    return ResolvedPeriod(preset=preset, start=dr.start, end=dr.end, granularity=granularity)


def _granularity_for_range(start: datetime, end: datetime) -> str:
    days = (end - start).days
    if days <= 14:
        return "daily"
    if days <= 90:
        return "weekly"
    return "monthly"
