"use client";

import { useEffect } from "react";

import { useFinnAIScore } from "../use-finnai-score";
import {
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  useAIScoreUiStore,
} from "../../store/ai-score-ui-store";

export function useAIScorePolling() {
  const isGenerating = useAIScoreUiStore((s) => s.isGenerating);
  const baselineGeneratedAt = useAIScoreUiStore((s) => s.baselineGeneratedAt);
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
    if (score?.generated_at && score.generated_at !== baselineGeneratedAt) {
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
    pollAttempts,
    stopGenerating,
    setGenerationTimedOut,
  ]);
}
