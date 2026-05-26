import { describe, expect, it, vi, afterEach } from "vitest";

import { getMe } from "@/features/auth/services/auth-service";

describe("auth service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getMe returns user on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "1",
          email: "user@test.com",
          name: "User",
          avatar_url: null,
          is_active: true,
        }),
      })
    );

    const user = await getMe();
    expect(user.email).toBe("user@test.com");
  });

  it("getMe throws on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      })
    );

    await expect(getMe()).rejects.toThrow();
  });
});
