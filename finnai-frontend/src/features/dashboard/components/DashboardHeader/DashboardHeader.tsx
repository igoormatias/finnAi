"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui";
import { useDashboardOverview } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { useAuth } from "@/features/auth";
import { formatPercent } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "1y", label: "1A" },
];

export type DashboardHeaderProps = {
  range: DateRangePreset;
  onRangeChange: (preset: DateRangePreset) => void;
};

export const DashboardHeader = ({ range, onRangeChange }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { data: overview } = useDashboardOverview();
  const firstName = user?.name?.split(" ")[0] ?? "Usuário";

  const subcopy =
    overview !== undefined
      ? `Taxa de economia: ${formatPercent(overview.savings_rate)} · ${overview.transaction_count} transações este mês`
      : "Carregando resumo financeiro…";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Olá, {firstName} 👋
        </h1>
        <p className="text-sm text-muted">{subcopy}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded-xl border border-border bg-elevated/40 p-1"
          role="group"
          aria-label="Período do dashboard"
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onRangeChange(preset.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                range === preset.id
                  ? "bg-primary text-bg"
                  : "text-muted hover:text-foreground"
              )}
              aria-pressed={range === preset.id}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Button variant="outline" size="icon" aria-label="Notificações" className="shrink-0">
          <Bell className="h-4 w-4" />
        </Button>

        <span className="hidden rounded-xl border border-border bg-elevated/40 px-3 py-2 text-xs text-muted sm:inline">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
