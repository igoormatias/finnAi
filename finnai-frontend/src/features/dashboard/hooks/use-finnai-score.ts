"use client";

import { useQuery } from "@tanstack/react-query";

import { getFinnAIScore } from "@/features/dashboard/services/dashboard-service";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useFinnAIScore() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.score(slug),
    queryFn: () => getFinnAIScore(slug),
    staleTime: 60_000,
    retry: false,
  });
}
