"use client";

import { AuthSyncProvider } from "@/providers/auth-sync-provider";
import { AuthSessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthSessionProvider>
        <QueryProvider>
          <AuthSyncProvider>
            {children}
            <ToastProvider />
          </AuthSyncProvider>
        </QueryProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}
