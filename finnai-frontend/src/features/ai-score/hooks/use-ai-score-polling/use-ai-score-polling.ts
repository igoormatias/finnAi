"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useFinnAIScore } from "../use-finnai-score";
import { isScorePopulated } from "../../utils/optimistic-score";
import {
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  useAIScoreUiStore,
} from "../../store/ai-score-ui-store";

function isFailureForCurrentAttempt(
  lastRequestedAt: string | null | undefined,
  regenerationStartedAt: string | null
): boolean {
  if (!regenerationStartedAt || !lastRequestedAt) return true;
  return new Date(lastRequestedAt).getTime() >= new Date(regenerationStartedAt).getTime() - 1000;
}

export function useAIScorePolling() {
  const isGenerating = useAIScoreUiStore((s) => s.isGenerating);
  const baselineGeneratedAt = useAIScoreUiStore((s) => s.baselineGeneratedAt);
  const regenerationStartedAt = useAIScoreUiStore((s) => s.regenerationStartedAt);
  const pollAttempts = useAIScoreUiStore((s) => s.pollAttempts);
  const incrementPoll = useAIScoreUiStore((s) => s.incrementPoll);
  const stopGenerating = useAIScoreUiStore((s) => s.stopGenerating);
  const setGenerationTimedOut = useAIScoreUiStore((s) => s.setGenerationTimedOut);

  const query = useFinnAIScore();

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      incrementPoll();
      void query.refetch();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isGenerating, incrementPoll, query]);

  useEffect(() => {
    if (!isGenerating) return;

    const score = query.data;

    if (score?.status === "failed") {
      if (!isFailureForCurrentAttempt(score.last_requested_at, regenerationStartedAt)) {
        return;
      }
      stopGenerating();
      toast.error("Não foi possível atualizar o score. Tente novamente em instantes.");
      return;
    }

    if (
      isScorePopulated(score) &&
      (baselineGeneratedAt === null || score.generated_at !== baselineGeneratedAt)
    ) {
      stopGenerating();
      return;
    }

    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      setGenerationTimedOut();
    }
  }, [
    isGenerating,
    query.data,
    baselineGeneratedAt,
    regenerationStartedAt,
    pollAttempts,
    stopGenerating,
    setGenerationTimedOut,
  ]);
}
