from __future__ import annotations

import hashlib
import hmac
import secrets


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_refresh_token(token: str, token_hash: str, secret: str) -> bool:
    expected = hash_refresh_token(token, secret)
    return hmac.compare_digest(expected, token_hash)
