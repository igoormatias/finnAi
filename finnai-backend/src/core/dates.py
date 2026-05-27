from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo


@dataclass(frozen=True)
class DateRange:
    start: datetime
    end: datetime


def get_zoneinfo(tz: str) -> ZoneInfo:
    return ZoneInfo(tz)


def normalize_range_to_utc(*, start: datetime, end: datetime, tz: str) -> DateRange:
    zone = get_zoneinfo(tz)
    start_local = _ensure_tz(start, zone)
    end_local = _ensure_tz(end, zone)
    if end_local < start_local:
        raise ValueError("end_date must be >= start_date")
    return DateRange(start=start_local.astimezone(timezone.utc), end=end_local.astimezone(timezone.utc))


def current_month_range_utc(*, now_utc: datetime | None = None, tz: str) -> DateRange:
    now = now_utc or datetime.now(timezone.utc)
    zone = get_zoneinfo(tz)
    now_local = now.astimezone(zone)
    start_local = datetime(year=now_local.year, month=now_local.month, day=1, tzinfo=zone)
    return DateRange(start=start_local.astimezone(timezone.utc), end=now)


def previous_month_range_utc(*, now_utc: datetime | None = None, tz: str) -> DateRange:
    now = now_utc or datetime.now(timezone.utc)
    zone = get_zoneinfo(tz)
    now_local = now.astimezone(zone)
    first_this_month = datetime(year=now_local.year, month=now_local.month, day=1, tzinfo=zone)
    last_prev_month = first_this_month - timedelta(days=1)
    start_prev_month = datetime(
        year=last_prev_month.year, month=last_prev_month.month, day=1, tzinfo=zone
    )
    end_prev_month = datetime(
        year=first_this_month.year,
        month=first_this_month.month,
        day=1,
        tzinfo=zone,
    ) - timedelta(microseconds=1)
    return DateRange(
        start=start_prev_month.astimezone(timezone.utc),
        end=end_prev_month.astimezone(timezone.utc),
    )


def iter_period_starts_utc(
    *, start_utc: datetime, end_utc: datetime, granularity: str, tz: str
) -> list[datetime]:
    zone = get_zoneinfo(tz)
    start_local = start_utc.astimezone(zone)
    end_local = end_utc.astimezone(zone)

    starts: list[datetime] = []
    cursor = _floor_to_bucket_local(start_local, granularity)
    while cursor <= end_local:
        starts.append(cursor.astimezone(timezone.utc))
        cursor = _add_bucket_local(cursor, granularity)
    return starts


def _ensure_tz(dt: datetime, tz: ZoneInfo) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=tz)
    return dt.astimezone(tz)


def _floor_to_bucket_local(dt: datetime, granularity: str) -> datetime:
    if granularity == "daily":
        return datetime(dt.year, dt.month, dt.day, tzinfo=dt.tzinfo)
    if granularity == "weekly":
        start = dt - timedelta(days=dt.weekday())
        return datetime(start.year, start.month, start.day, tzinfo=dt.tzinfo)
    if granularity == "monthly":
        return datetime(dt.year, dt.month, 1, tzinfo=dt.tzinfo)
    if granularity == "yearly":
        return datetime(dt.year, 1, 1, tzinfo=dt.tzinfo)
    raise ValueError("Invalid granularity")


def _add_bucket_local(dt: datetime, granularity: str) -> datetime:
    if granularity == "daily":
        return dt + timedelta(days=1)
    if granularity == "weekly":
        return dt + timedelta(days=7)
    if granularity == "monthly":
        year = dt.year + (1 if dt.month == 12 else 0)
        month = 1 if dt.month == 12 else dt.month + 1
        return datetime(year, month, 1, tzinfo=dt.tzinfo)
    if granularity == "yearly":
        return datetime(dt.year + 1, 1, 1, tzinfo=dt.tzinfo)
    raise ValueError("Invalid granularity")
