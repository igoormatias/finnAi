"use client";

import { useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { syncFromSession, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) syncFromSession();
  }, [isLoading, syncFromSession]);

  return <>{children}</>;
}
