"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { ChartSkeleton } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { resolveDateRange } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";

import { ExportDialog } from "../ExportDialog";
import { ReportsHeader } from "../ReportsHeader";

const CashflowChart = dynamic(
  () =>
    import("@/features/dashboard").then((m) => ({
      default: m.CashflowChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CategoryDonutChart = dynamic(
  () =>
    import("@/features/dashboard").then((m) => ({
      default: m.CategoryDonutChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const ReportsPage = () => {
  const slug = useWorkspaceSlug();
  const [range, setRange] = useState<DateRangePreset>("30d");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState<Date | null>(null);
  const [exportEnd, setExportEnd] = useState<Date | null>(null);

  const resolved = useMemo(() => {
    const r = resolveDateRange(range);
    return { startDate: new Date(r.startDate), endDate: new Date(r.endDate) };
  }, [range]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <ReportsHeader
        range={range}
        onRangeChange={setRange}
        onExportClick={({ startDate, endDate }) => {
          setExportStart(startDate);
          setExportEnd(endDate);
          setExportOpen(true);
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <CashflowChart range={range} />
        <CategoryDonutChart range={range} />
      </div>

      {slug && exportStart && exportEnd && (
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          slug={slug}
          defaultStartDate={exportStart ?? resolved.startDate}
          defaultEndDate={exportEnd ?? resolved.endDate}
        />
      )}
    </div>
  );
};

