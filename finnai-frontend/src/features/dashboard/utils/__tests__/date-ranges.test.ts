import { describe, expect, it } from "vitest";

import { resolveDateRange } from "@/features/dashboard/utils/date-ranges";

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

  it("returns monthly granularity for 1y", () => {
    const range = resolveDateRange("1y");
    expect(range.granularity).toBe("monthly");
    expect(range.preset).toBe("1y");
  });
});
