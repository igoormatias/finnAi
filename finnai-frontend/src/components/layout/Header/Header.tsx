"use client";

import { Menu, Search } from "lucide-react";

import { UserMenu } from "@/components/layout";
import { WorkspaceSwitcher } from "@/features/workspaces";
import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  onOpenMobileNav: () => void;
};

export const Header = ({ onOpenMobileNav }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-30 mb-4 shrink-0 px-1 pt-1">
      <header
        className={cn(
          "flex h-14 items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 backdrop-blur-md",
          "shadow-soft"
        )}
      >
        <button
          type="button"
          onClick={onOpenMobileNav}
          className={cn(
            "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-elevated/40 text-foreground transition-colors hover:bg-elevated md:hidden",
            focusRingClass
          )}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <WorkspaceSwitcher />

        <div className="ml-auto flex items-center gap-2">
          <div
            className="hidden items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2 text-sm text-muted md:flex"
            aria-hidden
          >
            <Search className="h-4 w-4" />
            <span>Buscar…</span>
          </div>

          <time
            className="hidden rounded-xl border border-border bg-elevated/40 px-3 py-2 text-sm text-foreground sm:block"
            dateTime={new Date().toISOString().slice(0, 10)}
          >
            {new Date().toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          <UserMenu />
        </div>
      </header>
    </div>
  );
};
