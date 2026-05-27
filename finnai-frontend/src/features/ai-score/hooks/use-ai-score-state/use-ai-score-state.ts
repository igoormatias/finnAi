"use client";

import { useEffect, useMemo } from "react";

import { useFinnAIScore } from "../use-finnai-score";
import { useRegenerateScore } from "../use-regenerate-score";
import { useAIScorePolling } from "../use-ai-score-polling";
import { useAIScoreHistoryStore } from "../../store/ai-score-history-store";
import { useAIScoreUiStore } from "../../store/ai-score-ui-store";
import type { AIScoreUiStatus } from "../../types";
import { isScorePopulated } from "../../utils/optimistic-score";
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
  const isPopulated = isScorePopulated(score);

  useEffect(() => {
    if (!score || !isPopulated) return;
    appendPoint(score.workspace_id, {
      score: score.score,
      generated_at: score.generated_at,
    });
  }, [score, isPopulated, appendPoint]);

  const canRegenerate = useMemo(() => {
    const role = permissions.currentRole;
    return role !== null && role !== "viewer";
  }, [permissions.currentRole]);

  const status: AIScoreUiStatus = useMemo(() => {
    if (query.isLoading && !score) return "loading";
    if (query.isError && !score) return "error";
    if (isGenerating || regenerate.isPending) return "generating";
    if (score?.status === "pending" || score?.status === "running") return "generating";
    if (score?.status === "failed") return "error";
    if (!score && !query.isLoading) return "empty";
    if (score && !isPopulated) return "generating";
    return "ready";
  }, [
    query.isLoading,
    query.isError,
    score,
    isGenerating,
    regenerate.isPending,
    isPopulated,
  ]);

  const isStale = score ? (score.is_stale ?? isScoreStale(score.generated_at)) : false;
  const history = score && isPopulated ? getHistory(score.workspace_id) : [];

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
