"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateGoal } from "@/features/goals/services/goals-service";
import type { GoalUpdateInput } from "@/features/goals/types";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useUpdateGoal() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: GoalUpdateInput }) =>
      updateGoal(slug, goalId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.overview(slug) }),
      ]);
      toast.success("Meta atualizada.");
    },
    onError: () => toast.error("Não foi possível atualizar a meta."),
  });
}
