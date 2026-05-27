import { afterEach, describe, expect, it, vi } from "vitest";

import { buildInviteUrl } from "./invite-link";

describe("invite link", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds invite url from env", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(buildInviteUrl("abc123")).toBe("http://localhost:3000/invites/abc123");
  });
});
