"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addGoalContribution,
  type Goal,
  type GoalContribution,
  type GoalContributionInput,
  type GoalsOverview,
} from "@/features/goals";import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

type AddContributionVars = {
  goalId: string;
  input: GoalContributionInput;
};

export function useAddGoalContribution() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, input }: AddContributionVars) =>
      addGoalContribution(slug, goalId, input),
    onMutate: async ({ goalId, input }) => {
      const listKey = queryKeys.goals.list(slug);
      const overviewKey = queryKeys.goals.overview(slug);
      const contributionsKey = queryKeys.goals.contributions(slug, goalId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: overviewKey }),
        queryClient.cancelQueries({ queryKey: contributionsKey }),
      ]);

      const previousGoals = queryClient.getQueryData<Goal[]>(listKey);
      const previousOverview = queryClient.getQueryData<GoalsOverview>(overviewKey);
      const previousContributions = queryClient.getQueryData<GoalContribution[]>(contributionsKey);

      const optimisticContribution: GoalContribution = {
        id: `optimistic-${Date.now()}`,
        goal_id: goalId,
        workspace_id: "",
        amount_cents: input.amount_cents,
        contributed_at: input.contributed_at ?? new Date().toISOString().slice(0, 10),
        notes: input.notes ?? null,
        created_by_user_id: null,
        created_at: new Date().toISOString(),
      };

      if (previousGoals) {
        queryClient.setQueryData<Goal[]>(
          listKey,
          previousGoals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const newCurrent = goal.current_amount_cents + input.amount_cents;
            const completed = newCurrent >= goal.target_amount_cents;
            return {
              ...goal,
              current_amount_cents: newCurrent,
              status: completed ? "completed" : goal.status,
            };
          })
        );
      }

      if (previousOverview) {
        queryClient.setQueryData<GoalsOverview>(overviewKey, {
          ...previousOverview,
          total_saved_cents: previousOverview.total_saved_cents + input.amount_cents,
        });
      }

      if (previousContributions) {
        queryClient.setQueryData<GoalContribution[]>(contributionsKey, [
          optimisticContribution,
          ...previousContributions,
        ]);
      } else {
        queryClient.setQueryData<GoalContribution[]>(contributionsKey, [optimisticContribution]);
      }

      return { previousGoals, previousOverview, previousContributions, goalId };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(slug), ctx.previousGoals);
      }
      if (ctx.previousOverview) {
        queryClient.setQueryData(queryKeys.goals.overview(slug), ctx.previousOverview);
      }
      if (ctx.previousContributions) {
        queryClient.setQueryData(
          queryKeys.goals.contributions(slug, ctx.goalId),
          ctx.previousContributions
        );
      } else {
        queryClient.removeQueries({ queryKey: queryKeys.goals.contributions(slug, ctx.goalId) });
      }
      toast.error("Não foi possível registrar o aporte.");
    },
    onSuccess: async (_goal, { goalId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.overview(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.contributions(slug, goalId) }),
      ]);
      toast.success("Aporte registrado.");
    },
  });
}
