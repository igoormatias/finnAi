import { describe, expect, it } from "vitest";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255),
  timezone: z.enum(["UTC", "America/Sao_Paulo"]),
});

describe("settings form schema", () => {
  it("accepts valid payload", () => {
    const result = schema.safeParse({ name: "Família", timezone: "America/Sao_Paulo" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = schema.safeParse({ name: "", timezone: "UTC" });
    expect(result.success).toBe(false);
  });
});
