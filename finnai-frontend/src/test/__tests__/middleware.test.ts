import { describe, expect, it } from "vitest";

import { resolveAuthRedirect } from "@/shared/config/middleware-utils";

describe("resolveAuthRedirect", () => {
  it("redirects guests away from protected routes", () => {
    const result = resolveAuthRedirect("/dashboard", false);
    expect(result).toContain("/login");
    expect(result).toContain("callbackUrl");
  });

  it("redirects authenticated users away from guest routes", () => {
    expect(resolveAuthRedirect("/login", true)).toBe("/dashboard");
    expect(resolveAuthRedirect("/", true)).toBe("/dashboard");
  });

  it("allows access when rules do not apply", () => {
    expect(resolveAuthRedirect("/dashboard", true)).toBeNull();
    expect(resolveAuthRedirect("/", false)).toBeNull();
  });

  it("protects workspace-scoped routes for guests", () => {
    const result = resolveAuthRedirect("/workspaces/familia-silva/dashboard", false);
    expect(result).toContain("/login");
  });

  it("allows authenticated access to workspace dashboard", () => {
    expect(
      resolveAuthRedirect("/workspaces/familia-silva/dashboard", true)
    ).toBeNull();
  });
});
