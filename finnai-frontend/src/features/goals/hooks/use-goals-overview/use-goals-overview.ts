"use client";

import { useQuery } from "@tanstack/react-query";

import { getGoalsOverview } from "@/features/goals";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useGoalsOverview() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.goals.overview(slug),
    queryFn: () => getGoalsOverview(slug),
    staleTime: 30_000,
  });
}
