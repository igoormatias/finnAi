"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { regenerateScore } from "../../services/ai-score-service";
import type { FinnAIScore } from "../../types";
import { applyPendingScoreOptimistic, isScorePopulated } from "../../utils/optimistic-score";
import { useAIScoreUiStore } from "../../store/ai-score-ui-store";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";
import { ApiError } from "@/shared/api/client";

export function useRegenerateScore() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();
  const startGenerating = useAIScoreUiStore((s) => s.startGenerating);
  const scoreKey = queryKeys.aiScore.detail(slug);

  return useMutation({
    mutationFn: () => regenerateScore(slug),
    onSuccess: (result) => {
      if (result.debounced) {
        if (result.retries_remaining === 0) {
          toast.message("Limite de tentativas atingido. Aguarde alguns minutos.");
        } else {
          toast.message("Aguarde alguns minutos antes de gerar novamente.");
        }
        return;
      }

      const current = queryClient.getQueryData<FinnAIScore | null>(scoreKey);
      queryClient.setQueryData<FinnAIScore | null>(scoreKey, applyPendingScoreOptimistic(current));
      startGenerating(isScorePopulated(current) ? current!.generated_at : null);
      void queryClient.refetchQueries({ queryKey: scoreKey });
      toast.message("IA analisando suas finanças…");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Você não tem permissão para regenerar o score.");
        return;
      }
      toast.error("Não foi possível iniciar a regeneração.");
    },
    onSettled: (data) => {
      if (data?.debounced) return;
      void queryClient.invalidateQueries({ queryKey: scoreKey });
    },
  });
}
