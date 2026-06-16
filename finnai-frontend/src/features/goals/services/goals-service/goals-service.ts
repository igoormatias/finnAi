import { apiFetch } from "@/shared/api/client";

import type {
  Goal,
  GoalContribution,
  GoalContributionInput,
  GoalCreateInput,
  GoalUpdateInput,
  GoalsOverview,
} from "../../types";

export async function listGoals(slug: string): Promise<Goal[]> {
  return apiFetch<Goal[]>(`workspaces/${slug}/goals`);
}

export async function getGoalsOverview(slug: string): Promise<GoalsOverview> {
  return apiFetch<GoalsOverview>(`workspaces/${slug}/goals/overview`);
}

export async function createGoal(slug: string, input: GoalCreateInput): Promise<Goal> {
  return apiFetch<Goal>(`workspaces/${slug}/goals`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateGoal(
  slug: string,
  goalId: string,
  input: GoalUpdateInput
): Promise<Goal> {
  return apiFetch<Goal>(`workspaces/${slug}/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addGoalContribution(
  slug: string,
  goalId: string,
  input: GoalContributionInput
): Promise<Goal> {
  return apiFetch<Goal>(`workspaces/${slug}/goals/${goalId}/contributions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listGoalContributions(
  slug: string,
  goalId: string
): Promise<GoalContribution[]> {
  return apiFetch<GoalContribution[]>(`workspaces/${slug}/goals/${goalId}/contributions`);
}

export async function deleteGoal(slug: string, goalId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/goals/${goalId}`, { method: "DELETE" });
}
