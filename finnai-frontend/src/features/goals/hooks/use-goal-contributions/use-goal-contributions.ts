"use client";

import { useQuery } from "@tanstack/react-query";

import { listGoalContributions } from "@/features/goals";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useGoalContributions(goalId: string, enabled = true) {
  const slug = useWorkspaceSlug();

  return useQuery({
    queryKey: queryKeys.goals.contributions(slug, goalId),
    queryFn: () => listGoalContributions(slug, goalId),
    enabled: enabled && Boolean(goalId),
    staleTime: 30_000,
  });
}
