import { describe, expect, it } from "vitest";

import { useAuthStore } from "./auth-store";

describe("auth store", () => {
  it("clears session state", () => {
    useAuthStore.getState().setUser({
      id: "1",
      email: "a@b.com",
      name: "Test",
      avatar_url: null,
      is_active: true,
    });
    useAuthStore.getState().setAccessToken("token");
    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.status).toBe("unauthenticated");
  });
});
