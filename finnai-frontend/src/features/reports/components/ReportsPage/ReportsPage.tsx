"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { PeriodFilter } from "@/components/ui";
import { ChartSkeleton } from "@/features/dashboard";
import type { DateRangePreset, ReportMode } from "@/features/dashboard/types";
import { resolveDateRange } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { cn } from "@/lib/utils";

import { ExportDialog } from "../ExportDialog";
import { ReportsHeader } from "../ReportsHeader";

const CashflowChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.CashflowChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CategoryDonutChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.CategoryDonutChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const REPORT_MODES: { id: ReportMode; label: string }[] = [
  { id: "historical", label: "Histórico" },
  { id: "projected", label: "Projetado" },
  { id: "complete", label: "Completo" },
];

export const ReportsPage = () => {
  const slug = useWorkspaceSlug();
  const [range, setRange] = useState<DateRangePreset>("last_90_days");
  const [mode, setMode] = useState<ReportMode>("historical");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState<Date | null>(null);
  const [exportEnd, setExportEnd] = useState<Date | null>(null);

  const resolved = useMemo(() => {
    const r = resolveDateRange(range);
    return { startDate: new Date(r.startDate), endDate: new Date(r.endDate) };
  }, [range]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <ReportsHeader
          range={range}
          onRangeChange={setRange}
          onExportClick={({ startDate, endDate }) => {
            setExportStart(startDate);
            setExportEnd(endDate);
            setExportOpen(true);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter
            range={range}
            onRangeChange={setRange}
            ariaLabel="Período dos relatórios"
          />
          <div
            className="inline-flex rounded-xl border border-border bg-elevated/40 p-1"
            role="group"
            aria-label="Modo do relatório"
          >
            {REPORT_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === item.id ? "bg-primary text-bg" : "text-muted hover:text-foreground"
                )}
                aria-pressed={mode === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CashflowChart range={range} mode={mode} />
        <CategoryDonutChart range={range} />
      </div>

      {slug && exportStart && exportEnd && (
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          slug={slug}
          defaultStartDate={exportStart ?? resolved.startDate}
          defaultEndDate={exportEnd ?? resolved.endDate}
          defaultMode={mode}
        />
      )}
    </div>
  );
};
