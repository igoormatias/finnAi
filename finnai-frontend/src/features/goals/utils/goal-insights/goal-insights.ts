import { formatCurrencyBRL } from "@/lib/formatters/money";

import type { Goal } from "../../types";
import { getGoalProgressPercent, getMonthlyProjectionCents } from "../goal-progress";

export function buildGoalInsight(goal: Goal): string {
  const percent = getGoalProgressPercent(goal);
  if (goal.status === "completed") {
    return `Parabéns! Você concluiu "${goal.name}". Considere definir uma nova meta para manter o ritmo.`;
  }
  if (goal.status === "paused") {
    return `"${goal.name}" está pausada. Retome quando estiver pronto para manter o progresso.`;
  }
  const monthly = getMonthlyProjectionCents(goal);
  if (monthly != null && monthly > 0) {
    return `Para atingir "${goal.name}" no prazo, reserve cerca de ${formatCurrencyBRL(monthly)} por mês (${percent}% concluído).`;
  }
  if (percent >= 75) {
    return `Você está na reta final de "${goal.name}" — faltam poucos passos para concluir.`;
  }
  if (percent < 25) {
    return `Comece com aportes regulares em "${goal.name}" para ganhar tração nos próximos meses.`;
  }
  return `Continue aportando em "${goal.name}" — você já avançou ${percent}% do valor alvo.`;
}

export function buildPortfolioInsight(goals: Goal[]): string {
  const active = goals.filter((g) => g.status === "active");
  if (active.length === 0) {
    return "Crie sua primeira meta para visualizar projeções e acompanhar seu progresso financeiro.";
  }
  const avg =
    active.reduce((acc, g) => acc + getGoalProgressPercent(g), 0) / Math.max(active.length, 1);
  return `Você tem ${active.length} meta(s) ativa(s) com progresso médio de ${Math.round(avg)}%. Priorize aportes nas metas de alta prioridade.`;
}
