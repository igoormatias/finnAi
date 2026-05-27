import type { FinnAIScore } from "../types";

export function applyPendingScoreOptimistic(score: FinnAIScore | null | undefined): FinnAIScore {
  const base: FinnAIScore = score ?? {
    workspace_id: "",
    score: 0,
    label: "",
    summary: "",
    strengths: [],
    weaknesses: [],
    tips: [],
    badges: [],
    generated_at: new Date().toISOString(),
    status: "pending",
    last_error: null,
    is_stale: true,
  };

  return {
    ...base,
    status: "pending",
    last_error: null,
  };
}

export function isScorePopulated(score: FinnAIScore | null | undefined): boolean {
  return (
    !!score &&
    score.status === "idle" &&
    score.label.trim().length > 0 &&
    score.summary.trim().length > 0
  );
}
