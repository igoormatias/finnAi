import type { RecurrenceRule } from "@/features/finance/types/finance-types";

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function getRecurrenceLabel(rule: RecurrenceRule | null | undefined): string {
  if (!rule) return "Recorrente";
  return RECURRENCE_LABELS[rule] ?? "Desconhecido";
}
