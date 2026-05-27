import type { GoalType } from "../../types";

export const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "emergency_reserve", label: "Reserva de emergência" },
  { value: "travel", label: "Viagem" },
  { value: "car", label: "Carro" },
  { value: "house", label: "Casa" },
  { value: "investment", label: "Investimento" },
  { value: "education", label: "Educação" },
  { value: "shopping", label: "Compras" },
  { value: "custom", label: "Personalizada" },
];

export function getGoalTypeLabel(type: GoalType): string {
  return GOAL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
} as const;

export const STATUS_LABELS = {
  active: "Ativa",
  completed: "Concluída",
  paused: "Pausada",
} as const;
