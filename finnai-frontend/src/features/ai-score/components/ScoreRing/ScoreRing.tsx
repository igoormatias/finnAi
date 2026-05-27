"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { getScoreTheme } from "../../utils/score-theme";
import { cn } from "@/lib/utils";

type ScoreRingProps = {
  score: number;
  size?: number;
  className?: string;
};

export const ScoreRing = memo(({ score, size = 160, className }: ScoreRingProps) => {
  const reduceMotion = useReducedMotion();
  const theme = getScoreTheme(score);
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", theme.glow, className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-elevated/60"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={theme.ring}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("text-4xl font-bold tabular-nums md:text-5xl", theme.text)}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">/ 100</span>
      </div>
    </div>
  );
});

ScoreRing.displayName = "ScoreRing";
