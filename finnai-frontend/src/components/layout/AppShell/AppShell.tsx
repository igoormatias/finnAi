"use client";

import { useCallback, useState } from "react";

import { PageTransition } from "@/components/motion";

import { Header } from "../Header";
import { MobileNavSheet } from "../MobileNavSheet";
import { Sidebar } from "../Sidebar";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="min-h-dvh bg-bg p-3 text-foreground md:p-4">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-[1400px] gap-3 md:gap-4">
        <div className="hidden shrink-0 md:block">
          <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileNav={() => setMobileOpen(true)} />

          <main id="main-content" className="min-w-0 flex-1 px-1 pb-6 md:px-2">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>

      <MobileNavSheet open={mobileOpen} onOpenChange={(open) => (open ? setMobileOpen(true) : closeMobile())} />
    </div>
  );
};
