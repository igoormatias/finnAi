from __future__ import annotations

from enum import StrEnum


class CategoryType(StrEnum):
    income = "income"
    expense = "expense"


class AccountType(StrEnum):
    checking = "checking"
    savings = "savings"
    wallet = "wallet"
    credit_card = "credit_card"
    investment = "investment"


class TransactionType(StrEnum):
    income = "income"
    expense = "expense"


class RecurrenceRule(StrEnum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"
