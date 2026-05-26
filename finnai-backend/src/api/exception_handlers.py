from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from domain.exceptions import (
    AccountNotFoundException,
    AIParseException,
    AIProviderException,
    AIScoreNotFoundException,
    CategoryNotFoundException,
    DomainException,
    DuplicateInviteException,
    ForbiddenException,
    InvalidTokenException,
    InviteAlreadyAcceptedException,
    InviteEmailMismatchException,
    InviteExpiredException,
    InviteNotFoundException,
    MembershipNotFoundException,
    TransactionNotFoundException,
    UnauthorizedException,
    UserNotFoundException,
    WorkspaceNotFoundException,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UnauthorizedException)
    async def unauthorized_handler(_: Request, exc: UnauthorizedException) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": exc.message})

    @app.exception_handler(InvalidTokenException)
    async def invalid_token_handler(_: Request, exc: InvalidTokenException) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": exc.message})

    @app.exception_handler(ForbiddenException)
    async def forbidden_handler(_: Request, exc: ForbiddenException) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": exc.message})

    @app.exception_handler(UserNotFoundException)
    async def user_not_found_handler(_: Request, exc: UserNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(WorkspaceNotFoundException)
    async def workspace_not_found_handler(
        _: Request, exc: WorkspaceNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(InviteNotFoundException)
    async def invite_not_found_handler(_: Request, exc: InviteNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(MembershipNotFoundException)
    async def membership_not_found_handler(
        _: Request, exc: MembershipNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(CategoryNotFoundException)
    async def category_not_found_handler(
        _: Request, exc: CategoryNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(AccountNotFoundException)
    async def account_not_found_handler(_: Request, exc: AccountNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(TransactionNotFoundException)
    async def transaction_not_found_handler(
        _: Request, exc: TransactionNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(AIScoreNotFoundException)
    async def ai_score_not_found_handler(_: Request, exc: AIScoreNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(AIProviderException)
    async def ai_provider_handler(_: Request, exc: AIProviderException) -> JSONResponse:
        return JSONResponse(status_code=502, content={"detail": exc.message})

    @app.exception_handler(AIParseException)
    async def ai_parse_handler(_: Request, exc: AIParseException) -> JSONResponse:
        return JSONResponse(status_code=502, content={"detail": exc.message})

    @app.exception_handler(InviteExpiredException)
    async def invite_expired_handler(_: Request, exc: InviteExpiredException) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.message})

    @app.exception_handler(InviteAlreadyAcceptedException)
    async def invite_already_accepted_handler(
        _: Request, exc: InviteAlreadyAcceptedException
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": exc.message})

    @app.exception_handler(InviteEmailMismatchException)
    async def invite_email_mismatch_handler(
        _: Request, exc: InviteEmailMismatchException
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": exc.message})

    @app.exception_handler(DuplicateInviteException)
    async def duplicate_invite_handler(_: Request, exc: DuplicateInviteException) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": exc.message})

    @app.exception_handler(DomainException)
    async def domain_handler(_: Request, exc: DomainException) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.message})
