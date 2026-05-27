import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ScoreHistoryPoint } from "../types";

type HistoryState = {
  byWorkspace: Record<string, ScoreHistoryPoint[]>;
  appendPoint: (workspaceId: string, point: ScoreHistoryPoint) => void;
  getHistory: (workspaceId: string) => ScoreHistoryPoint[];
};

export const useAIScoreHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      byWorkspace: {},
      appendPoint: (workspaceId, point) => {
        const current = get().byWorkspace[workspaceId] ?? [];
        const last = current[current.length - 1];
        if (last?.generated_at === point.generated_at && last.score === point.score) {
          return;
        }
        const next = [...current, point].slice(-24);
        set({
          byWorkspace: { ...get().byWorkspace, [workspaceId]: next },
        });
      },
      getHistory: (workspaceId) => get().byWorkspace[workspaceId] ?? [],
    }),
    { name: "finnai-ai-score-history" }
  )
);
