"use client";

import { useQuery } from "@tanstack/react-query";

import { listWorkspaces } from "@/features/workspaces/services/workspace-service";
import { queryKeys } from "@/shared/api/query-keys";

export function useOnboardingStatus() {
  const query = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: listWorkspaces,
  });

  const needsOnboarding = query.isSuccess && (query.data?.length ?? 0) === 0;

  return {
    ...query,
    needsOnboarding,
  };
}
