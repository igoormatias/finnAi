import { afterEach, describe, expect, it, vi } from "vitest";

import { listMembers } from "@/features/workspaces";

describe("members service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls list members endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    await listMembers("familia-silva");

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/proxy/workspaces/familia-silva/members"
    );
  });
});
