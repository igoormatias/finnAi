"use client";

import type { DateRangePreset } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

export const PERIOD_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "Mês" },
  { id: "last_90_days", label: "90D" },
  { id: "1y", label: "1A" },
  { id: "next_30_days", label: "+30D" },
  { id: "next_90_days", label: "+90D" },
];

export type PeriodFilterProps = {
  range: DateRangePreset;
  onRangeChange: (preset: DateRangePreset) => void;
  ariaLabel?: string;
  presets?: { id: DateRangePreset; label: string }[];
};

export const PeriodFilter = ({
  range,
  onRangeChange,
  ariaLabel = "Período",
  presets = PERIOD_PRESETS,
}: PeriodFilterProps) => (
  <div
    className="inline-flex flex-wrap rounded-xl border border-border bg-elevated/40 p-1"
    role="group"
    aria-label={ariaLabel}
  >
    {presets.map((preset) => (
      <button
        key={preset.id}
        type="button"
        onClick={() => onRangeChange(preset.id)}
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
);
