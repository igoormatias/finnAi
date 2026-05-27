"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";

type AIScoreEmptyProps = {
  onGenerate: () => void;
  canGenerate: boolean;
  isLoading?: boolean;
};

export const AIScoreEmpty = ({ onGenerate, canGenerate, isLoading }: AIScoreEmptyProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div variants={reduceMotion ? undefined : fadeUp} initial="hidden" animate="visible">
      <Card className="border-dashed border-primary/30 bg-linear-to-br from-primary/5 to-surface">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="h-7 w-7" aria-hidden />
          </span>
          <div className="max-w-md grid gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Seu FinnAI Score ainda não foi gerado</h2>
            <p className="text-sm text-muted">
              A IA analisa suas transações, categorias e hábitos para criar uma pontuação, badges e
              recomendações personalizadas.
            </p>
          </div>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Iniciando…" : "Gerar meu score"}
          </Button>
          {!canGenerate && (
            <p className="text-xs text-muted">Visualizadores não podem gerar o score.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
