import { describe, expect, it } from "vitest";

import type { WorkspaceMember } from "../../types";
import {
  canEditMember,
  canInvite,
  canRemoveMember,
  hasPermission,
} from "./permissions";

const member = (role: WorkspaceMember["role"], id = "m1", userId = "u1"): WorkspaceMember => ({
  id,
  workspace_id: "w1",
  user_id: userId,
  role,
  created_at: "2026-01-01T00:00:00Z",
  user_email: "a@example.com",
  user_name: "A",
});

describe("workspace permissions", () => {
  it("allows invite for admin roles", () => {
    expect(canInvite("owner")).toBe(true);
    expect(canInvite("admin")).toBe(true);
    expect(canInvite("member")).toBe(false);
    expect(canInvite("viewer")).toBe(false);
  });

  it("prevents admin from editing another admin", () => {
    const target = member("admin", "m2", "u2");
    expect(canEditMember("admin", target)).toBe(false);
    expect(canRemoveMember("admin", target, "u1")).toBe(false);
  });

  it("allows owner to edit member", () => {
    const target = member("member", "m2", "u2");
    expect(canEditMember("owner", target)).toBe(true);
    expect(canRemoveMember("owner", target, "u1")).toBe(true);
  });

  it("maps permission flags", () => {
    expect(hasPermission("owner", "deleteWorkspace")).toBe(true);
    expect(hasPermission("member", "leaveWorkspace")).toBe(true);
    expect(hasPermission("owner", "leaveWorkspace")).toBe(false);
  });
});
