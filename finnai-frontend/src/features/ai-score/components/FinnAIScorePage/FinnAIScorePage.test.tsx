import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FinnAIScorePage } from "./FinnAIScorePage";

vi.mock("../../hooks/use-ai-score-state", () => ({
  useAIScoreState: () => ({
    status: "ready",
    score: {
      workspace_id: "w1",
      score: 75,
      label: "Bom controle",
      summary: "Resumo",
      strengths: ["Poupa bem"],
      weaknesses: ["Gastos variáveis"],
      tips: ["Revise assinaturas"],
      badges: ["Economista Nato"],
      generated_at: new Date().toISOString(),
    },
    history: [
      { score: 70, generated_at: "2026-04-01T00:00:00Z" },
      { score: 75, generated_at: "2026-05-01T00:00:00Z" },
    ],
    isStale: false,
    isGenerating: false,
    canRegenerate: true,
    generationTimedOut: false,
    isRegenerating: false,
    refetch: vi.fn(),
    requestRegenerate: vi.fn(),
  }),
}));

vi.mock("@/features/workspaces", () => ({
  useWorkspaceSlug: () => "familia",
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe("FinnAIScorePage", () => {
  it("renders score sections", () => {
    render(<FinnAIScorePage />);
    expect(screen.getByRole("heading", { name: /FinnAI Score/i })).toBeInTheDocument();
    expect(screen.getByText("Bom controle")).toBeInTheDocument();
    expect(screen.getByText("Pontos fortes")).toBeInTheDocument();
    expect(screen.getByText("Economista Nato")).toBeInTheDocument();
  });
});
