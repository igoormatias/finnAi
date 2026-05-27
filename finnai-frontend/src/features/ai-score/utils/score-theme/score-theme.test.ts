import { describe, expect, it } from "vitest";

import { getNextTierTarget, getScoreTheme, isScoreStale } from "./score-theme";

describe("score-theme", () => {
  it("returns premium theme for high scores", () => {
    expect(getScoreTheme(85).label).toBe("Excelente");
  });

  it("returns warning theme for low scores", () => {
    expect(getScoreTheme(30).ring).toContain("orange");
  });

  it("computes next tier target", () => {
    expect(getNextTierTarget(40).target).toBe(50);
    expect(getNextTierTarget(90).target).toBe(100);
  });

  it("detects stale scores", () => {
    const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(isScoreStale(old)).toBe(true);
    expect(isScoreStale(new Date().toISOString())).toBe(false);
  });
});
