from __future__ import annotations

import re
import unicodedata


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug or "workspace"


def with_suffix(base_slug: str, suffix: int) -> str:
    if suffix <= 1:
        return base_slug
    return f"{base_slug}-{suffix}"
