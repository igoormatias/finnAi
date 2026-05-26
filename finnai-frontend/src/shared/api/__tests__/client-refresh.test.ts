import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { apiFetch } from "@/shared/api/client";

describe("apiFetch refresh", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clear();
  });

  it("retries after refresh on 401", async () => {
    useAuthStore.getState().setAccessToken("old-token");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: "Unauthorized" }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "new-token" }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch<{ ok: boolean }>("workspaces");
    expect(result.ok).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
