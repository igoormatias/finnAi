"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteGoal } from "@/features/goals/services/goals-service";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useDeleteGoal() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(slug, goalId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.overview(slug) }),
      ]);
      toast.success("Meta excluída.");
    },
    onError: () => toast.error("Não foi possível excluir a meta."),
  });
}
