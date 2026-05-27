import type { Goal } from "../../types";

export function getGoalProgressPercent(goal: Pick<Goal, "current_amount_cents" | "target_amount_cents">): number {
  if (goal.target_amount_cents <= 0) return 0;
  return Math.min(100, Math.round((goal.current_amount_cents / goal.target_amount_cents) * 100));
}

export function getMilestoneLabel(percent: number): string | null {
  if (percent >= 100) return "Meta atingida";
  if (percent >= 75) return "Reta final";
  if (percent >= 50) return "Metade do caminho";
  if (percent >= 25) return "Bom começo";
  return null;
}

export function getMonthlyProjectionCents(goal: Goal): number | null {
  if (!goal.target_date || goal.status !== "active") return null;
  const target = new Date(goal.target_date);
  const now = new Date();
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  if (months <= 0) return null;
  const remaining = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);
  return Math.ceil(remaining / months);
}

export function getEstimatedMonthsToComplete(goal: Goal, monthlyContributionCents: number): number | null {
  if (goal.status !== "active" || monthlyContributionCents <= 0) return null;
  const remaining = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);
  if (remaining === 0) return 0;
  return Math.ceil(remaining / monthlyContributionCents);
}
