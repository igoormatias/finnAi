import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth-store";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/auth/services/auth-service", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

describe("forceSignOut", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clear();
  });

  it("clears auth store and shows session expired toast", async () => {
    const { toast } = await import("sonner");
    const { logout } = await import("@/features/auth/services/auth-service");
    const { signOut } = await import("next-auth/react");

    useAuthStore.getState().setAccessToken("token");
    useAuthStore.getState().setUser({
      id: "1",
      email: "a@b.com",
      name: "Test",
      avatar_url: null,
      is_active: true,
    });

    const assignMock = vi.fn();
    vi.stubGlobal("location", { assign: assignMock });

    const { handleSessionExpired } = await import("./force-sign-out");
    await handleSessionExpired();

    expect(toast.error).toHaveBeenCalledWith("Sua sessão expirou. Faça login novamente.");
    expect(logout).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(assignMock).toHaveBeenCalledWith("/login?error=session_expired");
  });
});
