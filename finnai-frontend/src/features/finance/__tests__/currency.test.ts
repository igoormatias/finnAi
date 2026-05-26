import { describe, expect, it } from "vitest";

import { parseBRLToCents } from "@/features/finance/utils/currency";

describe("parseBRLToCents", () => {
  it("parses BRL formatted values", () => {
    expect(parseBRLToCents("R$ 12,34")).toBe(1234);
    expect(parseBRLToCents("12,34")).toBe(1234);
    expect(parseBRLToCents("1.234,56")).toBe(123456);
  });
});

