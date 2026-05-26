from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from domain.exceptions import (
    DomainException,
    InvalidTokenException,
    UnauthorizedException,
    UserNotFoundException,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UnauthorizedException)
    async def unauthorized_handler(_: Request, exc: UnauthorizedException) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": exc.message})

    @app.exception_handler(InvalidTokenException)
    async def invalid_token_handler(_: Request, exc: InvalidTokenException) -> JSONResponse:
        return JSONResponse(status_code=401, content={"detail": exc.message})

    @app.exception_handler(UserNotFoundException)
    async def user_not_found_handler(_: Request, exc: UserNotFoundException) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.message})

    @app.exception_handler(DomainException)
    async def domain_handler(_: Request, exc: DomainException) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.message})
