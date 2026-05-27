"use client";

import { useQuery } from "@tanstack/react-query";

import { listGoals } from "@/features/goals/services/goals-service";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useGoals() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.goals.list(slug),
    queryFn: () => listGoals(slug),
    staleTime: 30_000,
  });
}
