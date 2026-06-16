import { create } from "zustand";

type AIScoreUiState = {
  isGenerating: boolean;
  baselineGeneratedAt: string | null;
  regenerationStartedAt: string | null;
  pollAttempts: number;
  generationTimedOut: boolean;
  startGenerating: (baselineGeneratedAt: string | null) => void;
  incrementPoll: () => void;
  stopGenerating: () => void;
  setGenerationTimedOut: () => void;
  resetPoll: () => void;
};

export const useAIScoreUiStore = create<AIScoreUiState>((set) => ({
  isGenerating: false,
  baselineGeneratedAt: null,
  regenerationStartedAt: null,
  pollAttempts: 0,
  generationTimedOut: false,
  startGenerating: (baselineGeneratedAt) =>
    set({
      isGenerating: true,
      baselineGeneratedAt,
      regenerationStartedAt: new Date().toISOString(),
      pollAttempts: 0,
      generationTimedOut: false,
    }),
  incrementPoll: () => set((s) => ({ pollAttempts: s.pollAttempts + 1 })),
  stopGenerating: () =>
    set({
      isGenerating: false,
      baselineGeneratedAt: null,
      regenerationStartedAt: null,
      pollAttempts: 0,
    }),
  setGenerationTimedOut: () =>
    set({
      isGenerating: false,
      baselineGeneratedAt: null,
      regenerationStartedAt: null,
      generationTimedOut: true,
    }),
  resetPoll: () => set({ pollAttempts: 0, generationTimedOut: false }),
}));

export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 15;
