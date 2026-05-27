"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/motion";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const sidebar = useMemo(
    () => (
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onNavigate={closeMobile}
      />
    ),
    [collapsed, closeMobile]
  );

  return (
    <div className="min-h-dvh bg-bg text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] overflow-hidden rounded-none md:rounded-[22px] md:border md:border-border md:bg-surface/20 md:shadow-elevated">
        <div className="hidden md:block">{sidebar}</div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 md:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
          aria-hidden={!mobileOpen}
        >
          <div
            className={cn(
              "absolute inset-0 bg-black/55 transition-opacity",
              mobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-[280px] transition-transform",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {sidebar}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileNav={() => setMobileOpen(true)} />

          <main className="min-w-0 flex-1 p-4 md:p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}

