from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DefaultCategory:
    name: str
    type: str  # "income" | "expense"
    color: str
    icon: str
    is_fixed: bool = True


# Curated defaults for personal finance (pt-BR).
# `icon` is a string consumed by the frontend; keep stable identifiers.
DEFAULT_CATEGORIES: list[DefaultCategory] = [
    # Income
    DefaultCategory(name="Salário", type="income", color="#35e0a1", icon="briefcase"),
    DefaultCategory(name="Freelance", type="income", color="#60a5fa", icon="laptop"),
    DefaultCategory(name="Investimentos", type="income", color="#a78bfa", icon="trending-up"),
    DefaultCategory(name="Cashback", type="income", color="#34d399", icon="badge-percent"),
    DefaultCategory(name="Presente", type="income", color="#f472b6", icon="gift"),
    DefaultCategory(name="Reembolso", type="income", color="#93c5fd", icon="receipt"),
    DefaultCategory(name="Renda Extra", type="income", color="#22c55e", icon="sparkles"),
    DefaultCategory(name="Bonificação", type="income", color="#fbbf24", icon="award"),
    # Expense
    DefaultCategory(name="Alimentação", type="expense", color="#fb923c", icon="utensils"),
    DefaultCategory(name="Mercado", type="expense", color="#f97316", icon="shopping-basket"),
    DefaultCategory(name="Delivery", type="expense", color="#f97316", icon="truck"),
    DefaultCategory(name="Transporte", type="expense", color="#60a5fa", icon="bus"),
    DefaultCategory(name="Combustível", type="expense", color="#38bdf8", icon="fuel"),
    DefaultCategory(name="Moradia", type="expense", color="#a78bfa", icon="home"),
    DefaultCategory(name="Aluguel", type="expense", color="#a78bfa", icon="key"),
    DefaultCategory(name="Água", type="expense", color="#22d3ee", icon="droplet"),
    DefaultCategory(name="Luz", type="expense", color="#fbbf24", icon="zap"),
    DefaultCategory(name="Internet", type="expense", color="#60a5fa", icon="wifi"),
    DefaultCategory(name="Streaming", type="expense", color="#f472b6", icon="play"),
    DefaultCategory(name="Saúde", type="expense", color="#fb7185", icon="heart-pulse"),
    DefaultCategory(name="Academia", type="expense", color="#34d399", icon="dumbbell"),
    DefaultCategory(name="Educação", type="expense", color="#93c5fd", icon="graduation-cap"),
    DefaultCategory(name="Lazer", type="expense", color="#f472b6", icon="gamepad-2"),
    DefaultCategory(name="Viagem", type="expense", color="#60a5fa", icon="plane"),
    DefaultCategory(name="Assinaturas", type="expense", color="#94a3b8", icon="bookmark"),
    DefaultCategory(name="Compras", type="expense", color="#fb923c", icon="shopping-bag"),
    DefaultCategory(name="Cartão de Crédito", type="expense", color="#94a3b8", icon="credit-card"),
    DefaultCategory(name="Pets", type="expense", color="#f59e0b", icon="paw-print"),
]

