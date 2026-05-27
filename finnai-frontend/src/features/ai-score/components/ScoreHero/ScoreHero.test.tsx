import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScoreHero } from "./ScoreHero";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const score = {
  workspace_id: "w1",
  score: 88,
  label: "Excelente Controle Financeiro",
  summary: "Você mantém boa disciplina.",
  strengths: ["Reserva"],
  weaknesses: [],
  tips: ["Continue"],
  badges: ["Economista Nato"],
  generated_at: "2026-05-01T12:00:00Z",
};

describe("ScoreHero", () => {
  it("renders score and label", () => {
    render(<ScoreHero score={score} />);
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("Excelente Controle Financeiro")).toBeInTheDocument();
  });
});
