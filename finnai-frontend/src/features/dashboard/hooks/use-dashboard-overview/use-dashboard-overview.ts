"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useDashboardOverview() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.overview(slug),
    queryFn: () => getDashboardOverview(slug),
    staleTime: 30_000,
  });
}
