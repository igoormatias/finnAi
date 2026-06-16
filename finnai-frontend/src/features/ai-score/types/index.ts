export type FinnAIScore = {
  workspace_id: string;
  score: number;
  label: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  badges: string[];
  generated_at: string;
  status: "idle" | "pending" | "running" | "failed";
  last_error?: string | null;
  is_stale: boolean;
  last_requested_at?: string | null;
};

export type RegenerateScoreResponse = {
  status: string;
  debounced: boolean;
  retries_remaining?: number | null;
};

export type AIScoreUiStatus =
  | "loading"
  | "empty"
  | "ready"
  | "generating"
  | "error";

export type ScoreHistoryPoint = {
  score: number;
  generated_at: string;
};

/** @deprecated Use FinnAIScore fields directly; kept for dashboard widget compatibility */
export type FinnAIScorePreview = Pick<FinnAIScore, "score" | "label" | "summary">;
