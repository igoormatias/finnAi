from __future__ import annotations

from enum import Enum


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"


class AccountType(str, Enum):
    checking = "checking"
    savings = "savings"
    wallet = "wallet"
    credit_card = "credit_card"
    investment = "investment"


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class RecurrenceRule(str, Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"
