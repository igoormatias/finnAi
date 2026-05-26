from __future__ import annotations


class DomainException(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class InvalidTokenException(DomainException):
    pass


class UnauthorizedException(DomainException):
    pass


class UserNotFoundException(DomainException):
    pass
