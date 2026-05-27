"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, Target, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useWorkspaceSlug } from "@/features/workspaces";
import { fadeUp } from "@/lib/motion/variants";
import { workspacePath } from "@/shared/config/routes";

type AIRecommendationsProps = {
  tips: string[];
};

const TIP_ICONS = [Lightbulb, TrendingDown, Wallet, Target];

export const AIRecommendations = ({ tips }: AIRecommendationsProps) => {
  const reduceMotion = useReducedMotion();
  const slug = useWorkspaceSlug();

  return (
    <motion.div
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      animate="visible"
      className="grid gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dicas da IA</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {tips.length === 0 ? (
            <p className="text-sm text-muted">Gere seu score para receber recomendações.</p>
          ) : (
            tips.map((tip, index) => {
              const Icon = TIP_ICONS[index % TIP_ICONS.length];
              return (
                <div
                  key={tip}
                  className="flex gap-3 rounded-xl border border-border bg-elevated/30 p-4"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild className="cursor-pointer">
          <Link href={workspacePath(slug, "transactions")}>Ver gastos</Link>
        </Button>
        <Button variant="outline" asChild className="cursor-pointer">
          <Link href={workspacePath(slug, "goals")}>Metas sugeridas</Link>
        </Button>
      </div>
    </motion.div>
  );
};
