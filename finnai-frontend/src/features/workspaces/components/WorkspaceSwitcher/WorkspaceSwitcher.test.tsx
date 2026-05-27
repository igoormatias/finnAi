import { describe, expect, it } from "vitest";

import { getWorkspaceSectionFromPath, workspacePath } from "@/shared/config/routes";

describe("workspace switcher routing", () => {
  it("preserves section when building workspace path", () => {
    expect(workspacePath("familia", "members")).toBe("/workspaces/familia/members");
    expect(getWorkspaceSectionFromPath("/workspaces/familia/invites")).toBe("invites");
  });

  it("reads section from pathname", () => {
    expect(getWorkspaceSectionFromPath("/workspaces/x/settings")).toBe("settings");
  });
});
