"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";

type AIInsightsPanelProps = {
  strengths: string[];
  weaknesses: string[];
};

export const AIInsightsPanel = ({ strengths, weaknesses }: AIInsightsPanelProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={reduceMotion ? undefined : fadeUp}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2"
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Pontos fortes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strengths.length === 0 ? (
            <p className="text-sm text-muted">Nenhum ponto forte identificado ainda.</p>
          ) : (
            <ul className="grid gap-2 text-sm text-foreground">
              {strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Pontos de atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-muted">Nenhum alerta no momento.</p>
          ) : (
            <ul className="grid gap-2 text-sm text-foreground">
              {weaknesses.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
