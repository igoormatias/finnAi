"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategoryAnalytics } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { resolveDateRange } from "../../utils/date-ranges";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useCategoryAnalytics(preset: DateRangePreset) {
  const slug = useWorkspaceSlug();
  const range = resolveDateRange(preset);

  return useQuery({
    queryKey: queryKeys.dashboard.categories(slug, preset),
    queryFn: () =>
      getCategoryAnalytics(slug, {
        startDate: range.startDate,
        endDate: range.endDate,
        type: "expense",
      }),
    staleTime: 60_000,
  });
}
