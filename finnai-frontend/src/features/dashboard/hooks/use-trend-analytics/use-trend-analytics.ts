"use client";

import { useQuery } from "@tanstack/react-query";

import { getTrends } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useTrendAnalytics(period?: string) {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.trends(slug, period),
    queryFn: () => getTrends(slug, period),
    staleTime: 30_000,
  });
}
