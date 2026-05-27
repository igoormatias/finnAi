"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { regenerateScore } from "../../services/ai-score-service";
import type { FinnAIScore } from "../../types";
import { useAIScoreUiStore } from "../../store/ai-score-ui-store";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";
import { ApiError } from "@/shared/api/client";

export function useRegenerateScore() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();
  const startGenerating = useAIScoreUiStore((s) => s.startGenerating);

  return useMutation({
    mutationFn: () => regenerateScore(slug),
    onSuccess: (result) => {
      if (result.debounced) {
        toast.message("Aguarde alguns minutos antes de gerar novamente.");
        return;
      }

      const current = queryClient.getQueryData<FinnAIScore | null>(
        queryKeys.aiScore.detail(slug)
      );
      startGenerating(current?.generated_at ?? null);
      toast.message("IA analisando suas finanças…");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Você não tem permissão para regenerar o score.");
        return;
      }
      toast.error("Não foi possível iniciar a regeneração.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.aiScore.detail(slug) });
    },
  });
}
