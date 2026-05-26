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


class WorkspaceNotFoundException(DomainException):
    pass


class ForbiddenException(DomainException):
    pass


class InviteNotFoundException(DomainException):
    pass


class InviteExpiredException(DomainException):
    pass


class InviteAlreadyAcceptedException(DomainException):
    pass


class InviteEmailMismatchException(DomainException):
    pass


class DuplicateInviteException(DomainException):
    pass


class MembershipNotFoundException(DomainException):
    pass
