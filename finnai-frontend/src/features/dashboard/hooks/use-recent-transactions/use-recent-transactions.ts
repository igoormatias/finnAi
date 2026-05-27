"use client";

import { useQuery } from "@tanstack/react-query";

import { getRecentTransactions } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useRecentTransactions() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.transactions(slug),
    queryFn: () => getRecentTransactions(slug),
    staleTime: 30_000,
  });
}
