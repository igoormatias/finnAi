import { describe, expect, it } from "vitest";

import type { Goal } from "../../types";
import {
  getEstimatedMonthsToComplete,
  getGoalProgressPercent,
  getMilestoneLabel,
  getMonthlyProjectionCents,
} from "./goal-progress";

const baseGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: "1",
  workspace_id: "w",
  name: "Viagem",
  description: null,
  goal_type: "travel",
  target_amount_cents: 100_000,
  current_amount_cents: 25_000,
  target_date: "2027-12-31",
  priority: "medium",
  status: "active",
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe("goal-progress", () => {
  it("calculates percent capped at 100", () => {
    expect(getGoalProgressPercent(baseGoal())).toBe(25);
    expect(
      getGoalProgressPercent(baseGoal({ current_amount_cents: 150_000, target_amount_cents: 100_000 }))
    ).toBe(100);
  });

  it("returns milestone labels", () => {
    expect(getMilestoneLabel(80)).toBe("Reta final");
    expect(getMilestoneLabel(10)).toBeNull();
  });

  it("projects monthly savings when target date exists", () => {
    const monthly = getMonthlyProjectionCents(baseGoal());
    expect(monthly).toBeGreaterThan(0);
  });

  it("estimates months to complete", () => {
    const months = getEstimatedMonthsToComplete(baseGoal(), 10_000);
    expect(months).toBe(8);
  });
});
