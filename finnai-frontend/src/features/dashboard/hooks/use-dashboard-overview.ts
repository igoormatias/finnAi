"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/services/dashboard-service";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useDashboardOverview() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.overview(slug),
    queryFn: () => getDashboardOverview(slug),
    staleTime: 30_000,
  });
}
