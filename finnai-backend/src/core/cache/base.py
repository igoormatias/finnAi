from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class CacheEntry:
    value: bytes


class AnalyticsCache(Protocol):
    async def get(self, key: str) -> CacheEntry | None: ...

    async def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None: ...


class NoopCache:
    async def get(self, key: str) -> CacheEntry | None:
        return None

    async def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None:
        return None
