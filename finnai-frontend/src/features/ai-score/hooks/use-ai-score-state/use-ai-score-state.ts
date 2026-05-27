"use client";

import { useEffect, useMemo } from "react";

import { useFinnAIScore } from "../use-finnai-score";
import { useRegenerateScore } from "../use-regenerate-score";
import { useAIScorePolling } from "../use-ai-score-polling";
import { useAIScoreHistoryStore } from "../../store/ai-score-history-store";
import { useAIScoreUiStore } from "../../store/ai-score-ui-store";
import type { AIScoreUiStatus } from "../../types";
import { isScoreStale } from "../../utils/score-theme";
import { useWorkspacePermissions } from "@/features/workspaces";

export function useAIScoreState() {
  const query = useFinnAIScore();
  const regenerate = useRegenerateScore();
  const permissions = useWorkspacePermissions();
  const isGenerating = useAIScoreUiStore((s) => s.isGenerating);
  const generationTimedOut = useAIScoreUiStore((s) => s.generationTimedOut);
  const appendPoint = useAIScoreHistoryStore((s) => s.appendPoint);
  const getHistory = useAIScoreHistoryStore((s) => s.getHistory);

  useAIScorePolling();

  const score = query.data ?? null;

  useEffect(() => {
    if (!score) return;
    appendPoint(score.workspace_id, {
      score: score.score,
      generated_at: score.generated_at,
    });
  }, [score, appendPoint]);

  const canRegenerate = useMemo(() => {
    const role = permissions.currentRole;
    return role !== null && role !== "viewer";
  }, [permissions.currentRole]);

  const status: AIScoreUiStatus = useMemo(() => {
    if (query.isLoading && !score) return "loading";
    if (query.isError && !score) return "error";
    if (isGenerating) return "generating";
    if (!score && !query.isLoading) return "empty";
    return "ready";
  }, [query.isLoading, query.isError, score, isGenerating]);

  const isStale = score ? isScoreStale(score.generated_at) : false;
  const history = score ? getHistory(score.workspace_id) : [];

  const requestRegenerate = () => {
    useAIScoreUiStore.getState().resetPoll();
    regenerate.mutate();
  };

  return {
    status,
    score,
    history,
    isStale,
    isGenerating,
    canRegenerate,
    generationTimedOut,
    isRegenerating: regenerate.isPending,
    refetch: query.refetch,
    requestRegenerate,
  };
}
