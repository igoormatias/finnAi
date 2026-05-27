from __future__ import annotations

from fastapi import APIRouter, Request, Response

from api.deps_auth import AuthServiceDep, CurrentUserDep
from core.config import get_settings
from domain.exceptions import UnauthorizedException
from schemas.auth import AuthGoogleRequest, AuthResponse
from schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

def _get_cookie_value(request: Request, key: str) -> str | None:
    """
    Extract a cookie value from the raw `Cookie` header.

    If the request contains multiple cookies with the same name, returns None to
    avoid ambiguous refresh behavior.
    """
    raw = request.headers.get("cookie")
    if not raw:
        return request.cookies.get(key)
    value: str | None = None
    matches = 0
    for part in raw.split(";"):
        name, sep, v = part.strip().partition("=")
        if sep and name == key:
            value = v
            matches += 1
    if matches > 1:
        return None
    return value or request.cookies.get(key)


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        domain=settings.auth_cookie_domain,
        path="/",
    )


@router.post("/google", response_model=AuthResponse)
async def login_with_google(
    body: AuthGoogleRequest,
    response: Response,
    auth_service: AuthServiceDep,
) -> AuthResponse:
    tokens = await auth_service.login_with_google(body.id_token)
    _set_refresh_cookie(response, tokens.refresh_token)
    return AuthResponse(
        access_token=tokens.access_token,
        user=UserResponse.model_validate(tokens.user),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_tokens(
    request: Request,
    response: Response,
    auth_service: AuthServiceDep,
) -> AuthResponse:
    settings = get_settings()
    refresh_token = _get_cookie_value(request, settings.auth_cookie_name)
    if not refresh_token:
        raise UnauthorizedException("Refresh token missing")

    tokens = await auth_service.refresh(refresh_token)
    _set_refresh_cookie(response, tokens.refresh_token)
    return AuthResponse(
        access_token=tokens.access_token,
        user=UserResponse.model_validate(tokens.user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUserDep) -> UserResponse:
    return UserResponse.model_validate(current_user)
