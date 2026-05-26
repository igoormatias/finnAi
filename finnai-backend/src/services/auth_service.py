from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from core.config import Settings
from core.security.hashing import hash_refresh_token, verify_refresh_token
from domain.exceptions import (
    InvalidTokenException,
    UnauthorizedException,
    UserNotFoundException,
)
from integrations.google.exceptions import GoogleTokenValidationError
from integrations.google.token_verifier import GoogleTokenVerifier
from models.user import User
from repositories.session_repository import SessionRepository
from repositories.user_repository import UserRepository
from services.token_service import TokenService


@dataclass(frozen=True)
class AuthTokens:
    access_token: str
    refresh_token: str
    user: User


class AuthService:
    def __init__(
        self,
        session: AsyncSession,
        settings: Settings,
        token_service: TokenService,
        google_verifier: GoogleTokenVerifier,
    ) -> None:
        self._session = session
        self._settings = settings
        self._token_service = token_service
        self._google_verifier = google_verifier
        self._users = UserRepository(session)
        self._sessions = SessionRepository(session)

    async def login_with_google(self, id_token: str) -> AuthTokens:
        try:
            google_user = await self._google_verifier.verify_id_token(id_token)
        except GoogleTokenValidationError as exc:
            raise UnauthorizedException(exc.message) from exc

        user = await self._users.get_by_google_id(google_user.sub)
        if user is None:
            user = await self._users.get_by_email(google_user.email)
            if user is None:
                user = await self._users.create(
                    google_id=google_user.sub,
                    email=google_user.email,
                    name=google_user.name or google_user.email.split("@")[0],
                    avatar_url=google_user.picture,
                )
            else:
                user.google_id = google_user.sub
                user = await self._users.update_profile(
                    user,
                    name=google_user.name or user.name,
                    avatar_url=google_user.picture,
                )
        else:
            user = await self._users.update_profile(
                user,
                name=google_user.name or user.name,
                avatar_url=google_user.picture,
            )

        if not user.is_active:
            raise UnauthorizedException("User account is inactive")

        return await self._issue_tokens(user)

    async def refresh(self, refresh_token: str) -> AuthTokens:
        try:
            payload = self._token_service.decode_refresh_token(refresh_token)
        except InvalidTokenException as exc:
            raise UnauthorizedException(exc.message) from exc

        auth_session = await self._sessions.get_by_id(payload.sid)
        if auth_session is None:
            raise UnauthorizedException("Invalid refresh token")

        now = datetime.now(UTC)
        if auth_session.revoked_at is not None:
            raise UnauthorizedException("Refresh token has been revoked")
        expires_at = auth_session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at <= now:
            raise UnauthorizedException("Refresh token has expired")
        if auth_session.user_id != payload.sub:
            raise UnauthorizedException("Invalid refresh token session")

        if not verify_refresh_token(
            refresh_token,
            auth_session.refresh_token_hash,
            self._settings.jwt_refresh_secret_key,
        ):
            raise UnauthorizedException("Invalid refresh token")

        user = await self._users.get_by_id(payload.sub)
        if user is None:
            raise UserNotFoundException("User not found")
        if not user.is_active:
            raise UnauthorizedException("User account is inactive")

        await self._sessions.revoke(auth_session, now)
        await self._session.commit()
        return await self._issue_tokens(user)

    async def get_me(self, user_id: uuid.UUID) -> User:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise UserNotFoundException("User not found")
        if not user.is_active:
            raise UnauthorizedException("User account is inactive")
        return user

    async def _issue_tokens(self, user: User) -> AuthTokens:
        session_id = uuid.uuid4()
        expires_at = datetime.now(UTC) + timedelta(days=self._settings.refresh_token_expire_days)
        refresh_jwt = self._token_service.create_refresh_token(user.id, session_id)
        token_hash = hash_refresh_token(refresh_jwt, self._settings.jwt_refresh_secret_key)

        await self._sessions.create(
            session_id=session_id,
            user_id=user.id,
            refresh_token_hash=token_hash,
            expires_at=expires_at,
        )
        access_jwt = self._token_service.create_access_token(user.id)

        await self._session.commit()

        return AuthTokens(
            access_token=access_jwt,
            refresh_token=refresh_jwt,
            user=user,
        )
