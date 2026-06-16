import { describe, expect, it } from "vitest";

import { resolveDateRange } from "./date-ranges";

describe("resolveDateRange", () => {
  it("returns daily granularity for 7d", () => {
    const range = resolveDateRange("7d");
    expect(range.granularity).toBe("daily");
    expect(range.preset).toBe("7d");
    expect(range.startDate).toMatch(/T/);
    expect(range.endDate).toMatch(/T/);
  });

  it("returns weekly granularity for 30d", () => {
    const range = resolveDateRange("30d");
    expect(range.granularity).toBe("weekly");
    expect(range.preset).toBe("30d");
  });

  it("returns daily granularity for last_30_days", () => {
    const range = resolveDateRange("last_30_days");
    expect(range.granularity).toBe("daily");
  });

  it("returns weekly granularity for next_90_days", () => {
    const range = resolveDateRange("next_90_days");
    expect(range.granularity).toBe("weekly");
  });
});
