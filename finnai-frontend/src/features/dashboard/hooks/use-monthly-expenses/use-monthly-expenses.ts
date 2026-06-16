"use client";

import { useQuery } from "@tanstack/react-query";

import { getMonthlyExpenses } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useMonthlyExpenses() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.monthlyExpenses(slug),
    queryFn: () => getMonthlyExpenses(slug),
    staleTime: 60_000,
  });
}
