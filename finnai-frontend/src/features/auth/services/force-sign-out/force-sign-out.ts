"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { toast } from "sonner";

import { logout } from "../auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getQueryClient } from "@/shared/api/query-client-holder";
import { ROUTES } from "@/shared/config/routes";

let signingOut = false;

export type ForceSignOutOptions = {
  /** Show session-expired toast (default true for automatic expiry). */
  showSessionExpiredToast?: boolean;
  /** Redirect after sign-out (default true). */
  redirect?: boolean;
  /** Explicit redirect target (overrides login + loginError). */
  redirectPath?: string;
  /** Login error query param when redirecting after expiry. */
  loginError?: string;
};

export async function forceSignOut(options: ForceSignOutOptions = {}): Promise<void> {
  const {
    showSessionExpiredToast = false,
    redirect = true,
    redirectPath,
    loginError,
  } = options;

  if (signingOut) return;
  signingOut = true;

  try {
    if (showSessionExpiredToast) {
      toast.error("Sua sessão expirou. Faça login novamente.");
    }

    try {
      await logout();
    } catch {
      // Continue cleanup even if logout API fails.
    }

    useAuthStore.getState().clear();

    const client = getQueryClient();
    if (client) {
      await client.cancelQueries();
      client.clear();
    }

    try {
      await nextAuthSignOut({ redirect: false });
    } catch {
      // Continue redirect even if NextAuth signOut fails.
    }

    if (redirect && typeof window !== "undefined") {
      const target =
        redirectPath ??
        (loginError
          ? `${ROUTES.login}?error=${encodeURIComponent(loginError)}`
          : ROUTES.login);
      window.location.assign(target);
    }
  } finally {
    signingOut = false;
  }
}

export async function handleSessionExpired(): Promise<void> {
  await forceSignOut({
    showSessionExpiredToast: true,
    redirect: true,
    loginError: "session_expired",
  });
}
