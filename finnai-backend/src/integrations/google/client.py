from __future__ import annotations

import httpx

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleOAuthClient:
    def __init__(self, http_client: httpx.AsyncClient | None = None) -> None:
        self._http_client = http_client
        self._owns_client = http_client is None

    async def get_token_info(self, id_token: str) -> dict[str, object]:
        client = self._http_client or httpx.AsyncClient()
        try:
            response = await client.get(
                GOOGLE_TOKENINFO_URL,
                params={"id_token": id_token},
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
        finally:
            if self._owns_client:
                await client.aclose()
