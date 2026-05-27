"use client";

import { useQuery } from "@tanstack/react-query";

import { getAccountsAnalytics } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useAccountsAnalytics() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.accounts(slug),
    queryFn: () => getAccountsAnalytics(slug),
    staleTime: 60_000,
  });
}
