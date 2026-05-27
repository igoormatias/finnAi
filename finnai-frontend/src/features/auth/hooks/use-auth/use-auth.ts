"use client";

import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { forceSignOut } from "../../services/force-sign-out";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ROUTES } from "@/shared/config/routes";

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, accessToken, setUser, setAccessToken } = useAuthStore();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const signInWithGoogle = useCallback(async (callbackUrl?: string) => {
    try {
      await nextAuthSignIn("google", {
        callbackUrl: callbackUrl ?? ROUTES.dashboard,
      });
    } catch {
      toast.error("Não foi possível iniciar o login com Google.");
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await forceSignOut({
        showSessionExpiredToast: false,
        redirectPath: ROUTES.home,
      });
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  }, []);

  const syncFromSession = useCallback(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        avatar_url: session.user.avatar_url ?? session.user.image ?? null,
        is_active: true,
      });
    }
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
    }
  }, [session, setUser, setAccessToken]);

  return {
    user: user ?? (session?.user ? {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      avatar_url: session.user.avatar_url ?? session.user.image ?? null,
      is_active: true,
    } : null),
    accessToken: accessToken ?? session?.accessToken ?? null,
    isLoading,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    syncFromSession,
  };
}
