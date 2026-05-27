"use client";

import { useQuery } from "@tanstack/react-query";

import { getCashflow } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { resolveDateRange } from "../../utils/date-ranges";
import { useWorkspaceSlug } from "@/features/workspaces";
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
