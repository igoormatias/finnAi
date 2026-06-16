"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectedCashflow } from "@/features/dashboard";
import type { DateRangePreset, ReportMode } from "@/features/dashboard/types";
import { isFuturePreset, resolveDateRange } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useProjectedCashflow(preset: DateRangePreset, mode: ReportMode = "projected") {
  const slug = useWorkspaceSlug();
  const range = resolveDateRange(preset);
  const cashflowMode = mode === "historical" ? "projected" : mode === "complete" ? "combined" : "projected";
  const useProjected = mode !== "historical" || isFuturePreset(preset);

  return useQuery({
    queryKey: queryKeys.dashboard.cashflow(slug, preset, mode),
    queryFn: () =>
      getProjectedCashflow(slug, {
        startDate: range.startDate,
        endDate: range.endDate,
        granularity: range.granularity,
        mode: cashflowMode,
        period: preset,
      }),
    enabled: useProjected,
    staleTime: 60_000,
  });
}
