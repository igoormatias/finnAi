import type { FinnAIScore, RegenerateScoreResponse } from "../../types";
import { apiFetch } from "@/shared/api/client";

export async function getScore(slug: string): Promise<FinnAIScore> {
  return apiFetch<FinnAIScore>(`workspaces/${slug}/ai/score`);
}

export async function regenerateScore(slug: string): Promise<RegenerateScoreResponse> {
  return apiFetch<RegenerateScoreResponse>(`workspaces/${slug}/ai/regenerate`, {
    method: "POST",
  });
}
