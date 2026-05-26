from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from api.deps import DbSessionDep, SettingsDep
from domain.exceptions import InvalidTokenException, UnauthorizedException, UserNotFoundException
from integrations.google.client import GoogleOAuthClient
from integrations.google.token_verifier import GoogleTokenVerifier
from models.user import User
from repositories.user_repository import UserRepository
from services.auth_service import AuthService
from services.token_service import TokenService

bearer_scheme = HTTPBearer(auto_error=False)


def get_token_service(settings: SettingsDep) -> TokenService:
    return TokenService(settings)


def get_google_verifier(settings: SettingsDep) -> GoogleTokenVerifier:
    return GoogleTokenVerifier(GoogleOAuthClient(), settings.google_client_id)


async def get_auth_service(
    session: DbSessionDep,
    settings: SettingsDep,
    token_service: Annotated[TokenService, Depends(get_token_service)],
    google_verifier: Annotated[GoogleTokenVerifier, Depends(get_google_verifier)],
) -> AuthService:
    return AuthService(session, settings, token_service, google_verifier)


def _extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    return credentials.credentials


async def get_optional_user(
    session: DbSessionDep,
    token_service: Annotated[TokenService, Depends(get_token_service)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User | None:
    token = _extract_bearer_token(credentials)
    if not token:
        return None

    try:
        payload = token_service.decode_access_token(token)
    except InvalidTokenException:
        return None

    user = await UserRepository(session).get_by_id(payload.sub)
    if user is None or not user.is_active:
        return None
    return user


async def get_current_user(
    session: DbSessionDep,
    token_service: Annotated[TokenService, Depends(get_token_service)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User:
    token = _extract_bearer_token(credentials)
    if not token:
        raise UnauthorizedException("Not authenticated")

    try:
        payload = token_service.decode_access_token(token)
    except InvalidTokenException as exc:
        raise UnauthorizedException(exc.message) from exc

    user = await UserRepository(session).get_by_id(payload.sub)
    if user is None:
        raise UserNotFoundException("User not found")
    if not user.is_active:
        raise UnauthorizedException("User account is inactive")
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
OptionalUserDep = Annotated[User | None, Depends(get_optional_user)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
