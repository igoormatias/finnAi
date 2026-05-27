"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout } from "@/features/auth";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ROUTES } from "@/shared/config/routes";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, accessToken, setUser, setAccessToken, clear } = useAuthStore();

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
      await logout();
      clear();
      await nextAuthSignOut({ redirect: false });
      router.push(ROUTES.home);
      router.refresh();
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  }, [clear, router]);

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
