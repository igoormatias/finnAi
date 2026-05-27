import { describe, expect, it } from "vitest";

import { formatCentsBRL, formatGrowthRate, formatPercent } from "./money";

describe("money formatters", () => {
  it("formats cents as BRL", () => {
    expect(formatCentsBRL(12345)).toMatch(/123,45/);
  });

  it("formats percent from decimal", () => {
    expect(formatPercent(0.125)).toBe("12.5%");
  });

  it("formats growth rate with sign", () => {
    expect(formatGrowthRate(0.08)).toBe("+8.0%");
    expect(formatGrowthRate(-0.03)).toBe("-3.0%");
  });
});
