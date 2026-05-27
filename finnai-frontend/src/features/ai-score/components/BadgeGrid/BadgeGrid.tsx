"use client";

import { motion, useReducedMotion } from "framer-motion";

import { getBadgeMeta } from "../../utils/badge-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

type BadgeGridProps = {
  badges: string[];
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const BadgeGrid = ({ badges }: BadgeGridProps) => {
  const reduceMotion = useReducedMotion();

  if (badges.length === 0) return null;

  return (
    <Card className="border-border/80 bg-surface/60">
      <CardHeader>
        <CardTitle className="text-base">Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.ul
          variants={reduceMotion ? undefined : container}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {badges.map((name) => {
            const meta = getBadgeMeta(name);
            const Icon = meta.icon;
            return (
              <motion.li
                key={name}
                variants={reduceMotion ? undefined : item}
                className={cn(
                  "flex cursor-default items-start gap-3 rounded-2xl border border-border bg-elevated/40 p-4 transition-colors hover:bg-elevated/70",
                  meta.glow
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="mt-0.5 text-xs text-muted">{meta.description}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </CardContent>
    </Card>
  );
};
