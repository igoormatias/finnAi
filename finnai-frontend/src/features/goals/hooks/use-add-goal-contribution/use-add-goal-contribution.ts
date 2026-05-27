"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addGoalContribution } from "@/features/goals/services/goals-service";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useAddGoalContribution() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, amountCents }: { goalId: string; amountCents: number }) =>
      addGoalContribution(slug, goalId, amountCents),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.overview(slug) }),
      ]);
      toast.success("Aporte registrado.");
    },
    onError: () => toast.error("Não foi possível registrar o aporte."),
  });
}
