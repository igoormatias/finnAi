import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth-store";

import { apiFetch } from "./client";

vi.mock("@/features/auth/services/token-refresh-service", () => ({
  refreshAccessToken: vi.fn(),
}));

vi.mock("@/features/auth/services/force-sign-out", () => ({
  handleSessionExpired: vi.fn().mockResolvedValue(undefined),
}));

describe("apiFetch refresh", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clear();
  });

  it("retries after refresh on 401", async () => {
    const { refreshAccessToken } = await import("@/features/auth/services/token-refresh-service");
    vi.mocked(refreshAccessToken).mockResolvedValue("new-token");

    useAuthStore.getState().setAccessToken("old-token");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: "Unauthorized" }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch<{ ok: boolean }>("workspaces");
    expect(result.ok).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("calls handleSessionExpired when refresh fails on 401", async () => {
    const { refreshAccessToken } = await import("@/features/auth/services/token-refresh-service");
    const { handleSessionExpired } = await import("@/features/auth/services/force-sign-out");

    vi.mocked(refreshAccessToken).mockResolvedValue(null);

    useAuthStore.getState().setAccessToken("expired-token");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Unauthorized" }),
    }));

    await expect(apiFetch("workspaces")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Sessão expirada",
    });

    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
  });
});
