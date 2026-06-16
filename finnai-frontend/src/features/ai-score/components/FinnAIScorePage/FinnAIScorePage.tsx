"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { useFinancialPreferences } from "@/features/workspaces";
import { PeriodFilter } from "@/components/ui";
import { Badge } from "@/components/ui";
import { useAIScoreState } from "../../hooks/use-ai-score-state";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { AIRecommendations } from "../AIRecommendations";
import { AIScoreEmpty } from "../AIScoreEmpty";
import { AIScoreSkeleton } from "../AIScoreSkeleton";
import { AIScoreThinking } from "../AIScoreThinking";
import { BadgeGrid } from "../BadgeGrid";
import { RegenerateScoreDialog } from "../RegenerateScoreDialog";
import { ScoreHero } from "../ScoreHero";
import { ScoreHistoryChart } from "../ScoreHistoryChart";
import { ErrorState } from "@/components/states";
import { Button } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";
import type { DateRangePreset } from "@/features/dashboard/types";

export const FinnAIScorePage = () => {
  const reduceMotion = useReducedMotion();
  const [period, setPeriod] = useState<DateRangePreset>("this_month");
  const { data: prefs } = useFinancialPreferences();
  const {
    status,
    score,
    history,
    isStale,
    regenerationFailed,
    isGenerating,
    canRegenerate,
    generationTimedOut,
    isRegenerating,
    refetch,
    requestRegenerate,
  } = useAIScoreState();

  if (status === "loading") {
    return <AIScoreSkeleton />;
  }

  if (status === "generating") {
    return (
      <section className="grid gap-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Inteligência artificial
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">FinnAI Score</h1>
          <p className="text-sm text-muted">A IA está analisando suas finanças…</p>
        </header>
        <AIScoreThinking />
        {generationTimedOut && (
          <div
            className="flex items-start gap-3 rounded-xl border border-border bg-elevated/40 p-4 text-sm"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
            <div>
              <p className="font-medium text-foreground">A análise está demorando</p>
              <p className="text-muted">
                Tente atualizar ou iniciar uma nova regeneração.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refetch()}
                  className="cursor-pointer"
                >
                  Atualizar
                </Button>
                <Button
                  type="button"
                  onClick={requestRegenerate}
                  disabled={!canRegenerate}
                  className="cursor-pointer"
                >
                  Regenerar novamente
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (status === "error") {
    const message =
      score?.last_error && score.last_error.trim().length > 0
        ? `Detalhes: ${score.last_error}`
        : undefined;
    return (
      <ErrorState
        title="Não foi possível gerar o FinnAI Score."
        description={message}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              className="cursor-pointer"
            >
              Atualizar
            </Button>
            <Button
              type="button"
              onClick={requestRegenerate}
              disabled={!canRegenerate}
              className="cursor-pointer"
            >
              Regenerar score
            </Button>
          </div>
        }
      />
    );
  }

  if (status === "empty") {
    return (
      <section className="grid gap-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Inteligência artificial</p>
          <h1 className="text-2xl font-semibold tracking-tight">FinnAI Score</h1>
        </header>
        <AIScoreEmpty
          onGenerate={requestRegenerate}
          canGenerate={canRegenerate}
          isLoading={isRegenerating}
        />
        {isGenerating && <AIScoreThinking />}
      </section>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <section className="relative grid gap-6">
      {isGenerating && <AIScoreThinking />}

      <motion.header
        variants={reduceMotion ? undefined : fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Inteligência artificial</p>
          <h1 className="text-2xl font-semibold tracking-tight">FinnAI Score</h1>
          <p className="text-sm text-muted">
            Atualizado em{" "}
            {new Date(score.generated_at).toLocaleString("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          {prefs?.include_recurrences_in_projections && (
            <Badge variant="default" className="mt-2">
              Inclui projeções
            </Badge>
          )}
        </div>
        <PeriodFilter range={period} onRangeChange={setPeriod} ariaLabel="Período do score" />
        <RegenerateScoreDialog
          onConfirm={requestRegenerate}
          disabled={!canRegenerate}
          isLoading={isRegenerating}
        />
      </motion.header>

      {regenerationFailed && (
        <div
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Não foi possível atualizar o score</p>
            <p className="text-muted">Exibindo a última análise disponível.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 cursor-pointer"
              onClick={requestRegenerate}
              disabled={!canRegenerate}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {isStale && !regenerationFailed && (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Score desatualizado</p>
            <p className="text-muted">Regenere para refletir suas finanças mais recentes.</p>
          </div>
        </div>
      )}

      {generationTimedOut && (
        <div
          className="flex items-start gap-3 rounded-xl border border-border bg-elevated/40 p-4 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className="font-medium text-foreground">A análise está demorando</p>
            <p className="text-muted">Tente atualizar em alguns instantes.</p>
            <Button
              type="button"
              variant="ghost"
              className="mt-1 h-auto p-0 cursor-pointer"
              onClick={() => void refetch()}
            >
              Atualizar agora
            </Button>
          </div>
        </div>
      )}

      <ScoreHero score={score} />
      <BadgeGrid badges={score.badges} />
      <AIInsightsPanel strengths={score.strengths} weaknesses={score.weaknesses} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AIRecommendations tips={score.tips} />
        <ScoreHistoryChart history={history} />
      </div>
    </section>
  );
};
