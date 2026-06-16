import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAIScoreState } from "./use-ai-score-state";

const useFinnAIScoreMock = vi.fn();
const useRegenerateScoreMock = vi.fn();
const useAIScorePollingMock = vi.fn();
const uiStoreState = { isGenerating: false, generationTimedOut: false };

vi.mock("../use-finnai-score", () => ({
  useFinnAIScore: () => useFinnAIScoreMock(),
}));

vi.mock("../use-regenerate-score", () => ({
  useRegenerateScore: () => useRegenerateScoreMock(),
}));

vi.mock("../use-ai-score-polling", () => ({
  useAIScorePolling: () => useAIScorePollingMock(),
}));

vi.mock("../../store/ai-score-history-store", () => ({
  useAIScoreHistoryStore: (selector: (s: { appendPoint: () => void; getHistory: () => [] }) => unknown) =>
    selector({ appendPoint: vi.fn(), getHistory: () => [] }),
}));

vi.mock("../../store/ai-score-ui-store", () => ({
  useAIScoreUiStore: (selector: (s: typeof uiStoreState) => unknown) => selector(uiStoreState),
}));

vi.mock("@/features/workspaces", () => ({
  useWorkspacePermissions: () => ({ currentRole: "owner" }),
}));

describe("useAIScoreState", () => {
  it("returns generating when isGenerating even if score status is failed", () => {
    uiStoreState.isGenerating = true;
    useFinnAIScoreMock.mockReturnValue({
      data: {
        workspace_id: "w1",
        score: 0,
        label: "",
        summary: "",
        strengths: [],
        weaknesses: [],
        tips: [],
        badges: [],
        generated_at: "2026-05-27T17:09:12.000Z",
        status: "failed",
        last_error: "old error",
        is_stale: true,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useRegenerateScoreMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useAIScoreState());
    expect(result.current.status).toBe("generating");
  });

  it("returns ready when failed but prior score is displayable", () => {
    uiStoreState.isGenerating = false;
    useFinnAIScoreMock.mockReturnValue({
      data: {
        workspace_id: "w1",
        score: 58,
        label: "Capital acumulado",
        summary: "Resumo anterior válido",
        strengths: ["A"],
        weaknesses: ["B"],
        tips: ["C"],
        badges: ["D"],
        generated_at: "2026-05-27T17:09:12.000Z",
        status: "failed",
        last_error: "Failed to parse JSON object from AI response",
        is_stale: true,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useRegenerateScoreMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useAIScoreState());
    expect(result.current.status).toBe("ready");
    expect(result.current.regenerationFailed).toBe(true);
  });
});
