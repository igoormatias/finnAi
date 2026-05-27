"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { ScoreRing } from "../ScoreRing";
import type { FinnAIScore } from "../../types";
import { getNextTierTarget, getScoreTheme } from "../../utils/score-theme";
import { Badge } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

type ScoreHeroProps = {
  score: FinnAIScore;
};

export const ScoreHero = ({ score }: ScoreHeroProps) => {
  const reduceMotion = useReducedMotion();
  const theme = getScoreTheme(score.score);
  const next = getNextTierTarget(score.score);
  const progress = Math.min(100, Math.round((score.score / next.target) * 100));

  return (
    <motion.div
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-linear-to-br p-6 md:p-8",
        theme.gradient
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <ScoreRing score={score.score} size={176} />
        </div>
        <div className="grid gap-4 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <Badge variant="primary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              FinnAI Score
            </Badge>
            <Badge variant="default">{theme.label}</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {score.label}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">{score.summary}</p>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between text-xs font-medium text-muted">
              <span>Progresso até {next.label}</span>
              <span>{score.score} → {next.target}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated/60">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={reduceMotion ? { width: `${progress}%` } : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
