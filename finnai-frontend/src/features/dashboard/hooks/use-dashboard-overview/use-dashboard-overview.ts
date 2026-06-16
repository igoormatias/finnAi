"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useDashboardOverview(period?: string) {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.overview(slug, period),
    queryFn: () => getDashboardOverview(slug, period),
    staleTime: 30_000,
  });
}
