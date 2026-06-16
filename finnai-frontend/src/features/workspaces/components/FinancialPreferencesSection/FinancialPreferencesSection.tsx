"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import {
  useFinancialPreferences,
  useUpdateFinancialPreferences,
  useWorkspacePermissions,
} from "@/features/workspaces";
import type { DateRangePreset, ReportMode } from "@/features/dashboard/types";

const PERIOD_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "this_month", label: "Mês atual" },
  { value: "last_30_days", label: "Últimos 30 dias" },
  { value: "last_90_days", label: "Últimos 90 dias" },
  { value: "next_30_days", label: "Próximos 30 dias" },
];

const MODE_OPTIONS: { value: ReportMode; label: string }[] = [
  { value: "historical", label: "Histórico" },
  { value: "projected", label: "Projetado" },
  { value: "complete", label: "Completo" },
];

export const FinancialPreferencesSection = () => {
  const { data, isLoading } = useFinancialPreferences();
  const updatePrefs = useUpdateFinancialPreferences();
  const { can } = useWorkspacePermissions();
  const canEdit = can("editWorkspace");

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const patch = (body: Parameters<typeof updatePrefs.mutate>[0]) => {
    if (!canEdit) return;
    updatePrefs.mutate(body);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências financeiras</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Meses-alvo da reserva</span>
          <input
            type="number"
            min={1}
            max={36}
            disabled={!canEdit}
            className="rounded-lg border border-border bg-elevated px-3 py-2"
            value={data.emergency_reserve_target_months}
            onChange={(e) =>
              patch({ emergency_reserve_target_months: Number(e.target.value) })
            }
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-muted">Período padrão do dashboard</span>
          <select
            disabled={!canEdit}
            className="rounded-lg border border-border bg-elevated px-3 py-2"
            value={data.default_dashboard_period}
            onChange={(e) =>
              patch({ default_dashboard_period: e.target.value as DateRangePreset })
            }
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-muted">Período padrão dos relatórios</span>
          <select
            disabled={!canEdit}
            className="rounded-lg border border-border bg-elevated px-3 py-2"
            value={data.default_reports_period}
            onChange={(e) =>
              patch({ default_reports_period: e.target.value as DateRangePreset })
            }
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-muted">Modo padrão dos relatórios</span>
          <select
            disabled={!canEdit}
            className="rounded-lg border border-border bg-elevated px-3 py-2"
            value={data.default_reports_mode}
            onChange={(e) => patch({ default_reports_mode: e.target.value as ReportMode })}
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {(
          [
            ["include_future_transactions", "Incluir transações futuras"],
            ["include_past_transactions", "Incluir transações passadas"],
            ["include_goals_in_projections", "Incluir metas nas projeções"],
            ["include_recurrences_in_projections", "Incluir recorrências nas projeções"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!canEdit}
              checked={data[key]}
              onChange={(e) => patch({ [key]: e.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
};
