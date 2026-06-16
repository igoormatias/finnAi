"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createGoal, type GoalCreateInput } from "@/features/goals";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useCreateGoal() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GoalCreateInput) => createGoal(slug, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.overview(slug) }),
      ]);
      toast.success("Meta criada com sucesso.");
    },
    onError: () => toast.error("Não foi possível criar a meta."),
  });
}
