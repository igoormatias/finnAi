"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCentsBRL } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

import type { Goal } from "../../types";
import {
  getGoalTypeLabel,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../../utils/goal-types";
import { GoalProgressBar } from "../GoalProgressBar";

type GoalCardProps = {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
};

export const GoalCard = ({ goal, onEdit, onDelete }: GoalCardProps) => {
  const targetLabel = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Sem prazo";

  return (
    <Card
      interactive
      className={cn(
        "border-border/80",
        goal.status === "completed" && "border-success/30",
        goal.priority === "high" && goal.status === "active" && "border-primary/25"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{goal.name}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="primary">{getGoalTypeLabel(goal.goal_type)}</Badge>
            <Badge>{PRIORITY_LABELS[goal.priority]}</Badge>
            <Badge variant={goal.status === "completed" ? "success" : "default"}>
              {STATUS_LABELS[goal.status]}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar meta">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir meta">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted">Atual</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCentsBRL(goal.current_amount_cents)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Meta</p>
            <p className="text-sm font-medium text-muted">
              {formatCentsBRL(goal.target_amount_cents)}
            </p>
          </div>
        </div>
        <GoalProgressBar
          currentCents={goal.current_amount_cents}
          targetCents={goal.target_amount_cents}
        />
        <div className="flex items-center gap-2 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          <span>{targetLabel}</span>
        </div>
        {goal.description && (
          <p className="line-clamp-2 text-sm text-muted">{goal.description}</p>
        )}
      </CardContent>
    </Card>
  );
};
