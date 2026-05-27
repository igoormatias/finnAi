"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import { getGoalProgressPercent, getMilestoneLabel } from "../../utils/goal-progress";

type GoalProgressBarProps = {
  currentCents: number;
  targetCents: number;
  className?: string;
  showMilestone?: boolean;
};

export const GoalProgressBar = ({
  currentCents,
  targetCents,
  className,
  showMilestone = true,
}: GoalProgressBarProps) => {
  const reducedMotion = useReducedMotion();
  const percent = getGoalProgressPercent({
    current_amount_cents: currentCents,
    target_amount_cents: targetCents,
  });
  const milestone = showMilestone ? getMilestoneLabel(percent) : null;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-elevated/60"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso ${percent}%`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{percent}%</span>
        {milestone && <span className="text-primary">{milestone}</span>}
      </div>
    </div>
  );
};
