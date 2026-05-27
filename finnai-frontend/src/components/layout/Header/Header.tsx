"use client";

import { Menu, Search } from "lucide-react";

import { UserMenu } from "@/components/layout";
import { WorkspaceSwitcher } from "@/features/workspaces";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  onOpenMobileNav: () => void;
};

export const Header = ({ onOpenMobileNav }: HeaderProps) => {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-surface/50 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-elevated/40 text-foreground hover:bg-elevated md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <WorkspaceSwitcher />

      <div className="ml-auto flex items-center gap-2">
        <div
          className={cn(
            "hidden items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2 text-sm text-muted",
            "md:flex"
          )}
        >
          <Search className="h-4 w-4" />
          <span>Buscar…</span>
        </div>

        <div className="hidden rounded-xl border border-border bg-elevated/40 px-3 py-2 text-sm text-foreground sm:block">
          {new Date().toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
