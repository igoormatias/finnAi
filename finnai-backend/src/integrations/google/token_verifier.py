from __future__ import annotations

from datetime import datetime, timezone

from integrations.google.client import GoogleOAuthClient
from integrations.google.exceptions import GoogleTokenValidationError
from integrations.google.schemas import GoogleTokenInfo


def _is_email_verified(value: bool | str) -> bool:
    if isinstance(value, bool):
        return value
    return value.lower() == "true"


class GoogleTokenVerifier:
    def __init__(self, client: GoogleOAuthClient, google_client_id: str) -> None:
        self._client = client
        self._google_client_id = google_client_id

    async def verify_id_token(self, id_token: str) -> GoogleTokenInfo:
        try:
            raw = await self._client.get_token_info(id_token)
            token_info = GoogleTokenInfo.model_validate(raw)
        except Exception as exc:
            raise GoogleTokenValidationError("Failed to validate Google token") from exc

        if token_info.aud != self._google_client_id:
            raise GoogleTokenValidationError("Invalid Google token audience")

        if not _is_email_verified(token_info.email_verified):
            raise GoogleTokenValidationError("Google email is not verified")

        expires_at = datetime.fromtimestamp(token_info.exp, tz=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            raise GoogleTokenValidationError("Google token has expired")

        return token_info
