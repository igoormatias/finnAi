"use client";

import { useQuery } from "@tanstack/react-query";

import { getScore } from "../../services/ai-score-service";
import type { FinnAIScore } from "../../types";
import { useAIScoreUiStore } from "../../store/ai-score-ui-store";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";
import { ApiError } from "@/shared/api/client";

export function useFinnAIScore() {
  const slug = useWorkspaceSlug();
  const isGenerating = useAIScoreUiStore((s) => s.isGenerating);

  return useQuery({
    queryKey: queryKeys.aiScore.detail(slug),
    queryFn: async (): Promise<FinnAIScore | null> => {
      try {
        return await getScore(slug);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    staleTime: isGenerating ? 0 : 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
