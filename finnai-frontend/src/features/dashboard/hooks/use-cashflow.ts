"use client";

import { useQuery } from "@tanstack/react-query";

import { getCashflow } from "@/features/dashboard/services/dashboard-service";
import type { DateRangePreset } from "@/features/dashboard/types";
import { resolveDateRange } from "@/features/dashboard/utils/date-ranges";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useCashflow(preset: DateRangePreset) {
  const slug = useWorkspaceSlug();
  const range = resolveDateRange(preset);

  return useQuery({
    queryKey: queryKeys.dashboard.cashflow(slug, preset),
    queryFn: () =>
      getCashflow(slug, {
        startDate: range.startDate,
        endDate: range.endDate,
        granularity: range.granularity,
      }),
    staleTime: 60_000,
  });
}
