import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GoalsPage } from "./GoalsPage";

vi.mock("../../hooks/use-goals", () => ({
  useGoals: () => ({
    isLoading: false,
    isError: false,
    data: [
      {
        id: "g1",
        workspace_id: "w1",
        name: "Viagem Europa",
        description: null,
        goal_type: "travel",
        target_amount_cents: 100_000,
        current_amount_cents: 40_000,
        target_date: "2027-01-01",
        priority: "high",
        status: "active",
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-goals-overview", () => ({
  useGoalsOverview: () => ({
    data: {
      active_count: 1,
      completed_count: 0,
      total_saved_cents: 40_000,
      total_progress_percent: 40,
    },
  }),
}));

vi.mock("../../hooks/use-create-goal", () => ({
  useCreateGoal: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("../../hooks/use-update-goal", () => ({
  useUpdateGoal: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("../../hooks/use-delete-goal", () => ({
  useDeleteGoal: () => ({ mutate: vi.fn() }),
}));
vi.mock("../../hooks/use-add-goal-contribution", () => ({
  useAddGoalContribution: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("../../hooks/use-goal-contributions", () => ({
  useGoalContributions: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/features/workspaces", () => ({
  useWorkspacePermissions: () => ({ currentRole: "owner" }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("GoalsPage", () => {
  it("renders goals list and overview", () => {
    render(<GoalsPage />);
    expect(screen.getByRole("heading", { name: "Metas" })).toBeInTheDocument();
    expect(screen.getByText("Viagem Europa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Aportar/i })).toBeInTheDocument();
    expect(screen.getByText("Metas ativas")).toBeInTheDocument();
  });
});
