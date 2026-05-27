"use client";

import { useQuery } from "@tanstack/react-query";

import { getTrends } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useTrendAnalytics() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.trends(slug),
    queryFn: () => getTrends(slug),
    staleTime: 30_000,
  });
}
