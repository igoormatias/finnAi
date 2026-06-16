from __future__ import annotations

import json
from dataclasses import dataclass


@dataclass(frozen=True)
class PromptBuildResult:
    prompt: str
    prompt_version: str


def build_financial_score_prompt(*, input_payload: dict) -> PromptBuildResult:
    prompt_version = "v3_ptbr_projections"
    schema = {
        "score": 0,
        "label": "string",
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "tips": ["string"],
        "badges": ["string"],
    }
    example = {
        "score": 85,
        "label": "Bom controle financeiro",
        "summary": "Você mantém um bom equilíbrio entre entradas e saídas, com oportunidades de melhorar a previsibilidade dos gastos.",
        "strengths": ["Boa taxa de poupança", "Controle de despesas fixas"],
        "weaknesses": ["Gastos variáveis acima do ideal"],
        "tips": ["Defina um teto mensal para lazer e alimentação fora"],
        "badges": ["Disciplina Financeira"],
    }
    instructions = (
        "Você é o FinnAI Score, um analista financeiro.\n"
        "Responda APENAS com JSON válido (sem markdown, sem texto extra).\n"
        "Siga EXATAMENTE este schema (chaves e tipos):\n"
        f"{json.dumps(schema, ensure_ascii=False)}\n"
        "Idioma obrigatório:\n"
        "- Escreva label, summary e TODOS os itens das listas em português (pt-BR).\n"
        "- Não use inglês.\n"
        "Restrições:\n"
        "- score deve ser um inteiro de 0 a 100\n"
        "- summary com no máximo 280 caracteres\n"
        "- cada item de strengths, weaknesses, tips e badges com no máximo 120 caracteres\n"
        "- listas com no máximo 5 itens cada\n"
        "- seja conciso e acionável\n"
        "- retorne JSON completo e válido (feche todas as chaves e listas)\n"
        "- use emergency_reserve, projected_30d e recurring_income_share quando disponíveis\n"
        "- gere insights como: tendência de saldo, meses de reserva, risco de déficit futuro, "
        "% da renda comprometida por despesas recorrentes\n"
        "Exemplo de resposta (apenas para referência de idioma e formato):\n"
        f"{json.dumps(example, ensure_ascii=False)}\n"
    )
    payload = json.dumps(input_payload, ensure_ascii=False, separators=(",", ":"))
    prompt = f"{instructions}\nINPUT:\n{payload}\n"
    return PromptBuildResult(prompt=prompt, prompt_version=prompt_version)
