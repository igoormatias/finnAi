"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { ErrorState } from "@/components/states";
import { Button } from "@/components/ui";

import { useWorkspacePermissions } from "@/features/workspaces";

import { useAddGoalContribution } from "../../hooks/use-add-goal-contribution";
import { useCreateGoal } from "../../hooks/use-create-goal";
import { useDeleteGoal } from "../../hooks/use-delete-goal";
import { useGoals } from "../../hooks/use-goals";
import { useGoalsOverview } from "../../hooks/use-goals-overview";
import { useUpdateGoal } from "../../hooks/use-update-goal";
import type { Goal } from "../../types";
import { ContributeGoalDialog } from "../ContributeGoalDialog";
import { CreateGoalDialog } from "../CreateGoalDialog";
import { GoalAnalyticsPanel } from "../GoalAnalyticsPanel";
import { GoalCard } from "../GoalCard";
import { GoalsEmpty } from "../GoalsEmpty";
import { GoalsOverviewCards } from "../GoalsOverviewCards";
import { GoalsSkeleton } from "../GoalsSkeleton";

export const GoalsPage = () => {
  const permissions = useWorkspacePermissions();
  const goalsQuery = useGoals();
  const overviewQuery = useGoalsOverview();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addContribution = useAddGoalContribution();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [goalFormKey, setGoalFormKey] = useState(0);
  const [contributeFormKey, setContributeFormKey] = useState(0);

  const canWrite = permissions.currentRole !== "viewer";
  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const activeGoals = useMemo(() => goals.filter((g) => g.status === "active"), [goals]);

  const openCreate = () => {
    setEditing(null);
    setGoalFormKey((key) => key + 1);
    setDialogOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setGoalFormKey((key) => key + 1);
    setDialogOpen(true);
  };

  const openContribute = (goal: Goal) => {
    setContributingGoal(goal);
    setContributeFormKey((key) => key + 1);
    setContributeOpen(true);
  };

  if (goalsQuery.isLoading) return <GoalsSkeleton />;

  if (goalsQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          title="Não foi possível carregar metas"
          action={
            <Button variant="outline" onClick={() => void goalsQuery.refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Finanças</p>
          <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted">
            Planeje objetivos, acompanhe progresso e registre aportes manualmente.
          </p>
        </div>
        {canWrite && (
          <Button type="button" onClick={openCreate} className="cursor-pointer shrink-0">
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        )}
      </header>

      {overviewQuery.data && <GoalsOverviewCards overview={overviewQuery.data} />}

      {goals.length > 0 && <GoalAnalyticsPanel goals={goals} />}

      {goals.length === 0 ? (
        <GoalsEmpty onCreate={canWrite ? openCreate : () => undefined} />
      ) : (
        <StaggerChildren className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <StaggerItem key={goal.id}>
              <GoalCard
                goal={goal}
                canContribute={canWrite}
                onContribute={() => openContribute(goal)}
                onEdit={() => openEdit(goal)}
                onDelete={() => {
                  if (confirm(`Excluir a meta "${goal.name}"?`)) {
                    deleteGoal.mutate(goal.id);
                  }
                }}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <CreateGoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        formKey={goalFormKey}
        isSubmitting={createGoal.isPending || updateGoal.isPending}
        onSubmit={(input) => {
          if (editing) {
            updateGoal.mutate(
              { goalId: editing.id, input },
              { onSuccess: () => setDialogOpen(false) }
            );
          } else {
            createGoal.mutate(input, { onSuccess: () => setDialogOpen(false) });
          }
        }}
      />

      <ContributeGoalDialog
        open={contributeOpen}
        onOpenChange={(open) => {
          setContributeOpen(open);
          if (!open) setContributingGoal(null);
        }}
        goal={contributingGoal}
        formKey={contributeFormKey}
        isSubmitting={addContribution.isPending}
        onSubmit={(input) => {
          if (!contributingGoal) return;
          addContribution.mutate(
            { goalId: contributingGoal.id, input },
            {
              onSuccess: () => {
                setContributeOpen(false);
                setContributingGoal(null);
              },
            }
          );
        }}
      />

      {activeGoals.length > 0 && (
        <p className="sr-only" aria-live="polite">
          {activeGoals.length} metas ativas
        </p>
      )}
    </PageContainer>
  );
};
