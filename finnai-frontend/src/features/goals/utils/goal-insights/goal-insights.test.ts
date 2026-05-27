import { describe, expect, it } from "vitest";

import type { Goal } from "../../types";
import { buildGoalInsight, buildPortfolioInsight } from "./goal-insights";

const goal: Goal = {
  id: "1",
  workspace_id: "w",
  name: "Reserva",
  description: null,
  goal_type: "emergency_reserve",
  target_amount_cents: 100_000,
  current_amount_cents: 80_000,
  target_date: "2027-06-01",
  priority: "high",
  status: "active",
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("goal-insights", () => {
  it("builds active goal insight", () => {
    expect(buildGoalInsight(goal)).toContain("Reserva");
  });

  it("builds portfolio insight for empty list", () => {
    expect(buildPortfolioInsight([])).toContain("primeira meta");
  });
});
