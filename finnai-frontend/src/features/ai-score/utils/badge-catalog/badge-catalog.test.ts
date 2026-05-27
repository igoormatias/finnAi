import { describe, expect, it } from "vitest";

import { getBadgeMeta } from "./badge-catalog";

describe("badge-catalog", () => {
  it("returns known badge metadata", () => {
    const meta = getBadgeMeta("Economista Nato");
    expect(meta.description).toMatch(/economia/i);
  });

  it("falls back for unknown badges", () => {
    const meta = getBadgeMeta("Badge Custom");
    expect(meta.description).toBeTruthy();
  });
});
