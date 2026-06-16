"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FinancialPreferences } from "@/features/dashboard/types";
import {
  getFinancialPreferences,
  updateFinancialPreferences,
} from "../../services/financial-preferences-service";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useFinancialPreferences() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.workspaces.financialPreferences(slug),
    queryFn: () => getFinancialPreferences(slug),
    staleTime: 60_000,
  });
}

export function useUpdateFinancialPreferences() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<FinancialPreferences>) =>
      updateFinancialPreferences(slug, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.financialPreferences(slug),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.aiScore.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(slug) });
    },
  });
}
