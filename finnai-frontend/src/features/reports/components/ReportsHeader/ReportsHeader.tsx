"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button, Input } from "@/components/ui";
import type { DateRangePreset } from "@/features/dashboard/types";
import { resolveDateRange } from "@/features/dashboard";
import { cn } from "@/lib/utils";

export type ReportsHeaderProps = {
  range: DateRangePreset;
  onRangeChange: (preset: DateRangePreset) => void;
  onExportClick: (range: { startDate: Date; endDate: Date }) => void;
};

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "1y", label: "1A" },
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const ReportsHeader = ({ range, onRangeChange, onExportClick }: ReportsHeaderProps) => {
  const [customEnabled, setCustomEnabled] = useState(false);

  const resolved = useMemo(() => {
    const r = resolveDateRange(range);
    return {
      startDate: startOfDay(new Date(r.startDate)),
      endDate: endOfDay(new Date(r.endDate)),
    };
  }, [range]);

  const [customStart, setCustomStart] = useState<Date>(resolved.startDate);
  const [customEnd, setCustomEnd] = useState<Date>(resolved.endDate);

  const exportRange = customEnabled ? { startDate: customStart, endDate: customEnd } : resolved;
  const canExport = exportRange.startDate <= exportRange.endDate;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Relatórios
        </h1>
        <p className="text-sm text-muted">
          Visualize tendências e exporte suas transações para CSV/XLSX.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded-xl border border-border bg-elevated/40 p-1"
          role="group"
          aria-label="Período dos relatórios"
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setCustomEnabled(false);
                onRangeChange(preset.id);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                range === preset.id ? "bg-primary text-bg" : "text-muted hover:text-foreground"
              )}
              aria-pressed={range === preset.id}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCustomEnabled((v) => !v)}
          aria-pressed={customEnabled}
        >
          {customEnabled ? "Usar presets" : "Personalizar datas"}
        </Button>

        <Button onClick={() => onExportClick(exportRange)} disabled={!canExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {customEnabled && (
        <div className="grid gap-2 sm:col-span-2 sm:w-full sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Início</span>
            <Input
              type="date"
              value={toDateInputValue(customStart)}
              onChange={(e) => setCustomStart(startOfDay(new Date(e.target.value)))}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Fim</span>
            <Input
              type="date"
              value={toDateInputValue(customEnd)}
              onChange={(e) => setCustomEnd(endOfDay(new Date(e.target.value)))}
            />
          </label>
        </div>
      )}
    </div>
  );
};

