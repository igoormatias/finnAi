"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspaceSlugOptional } from "@/features/workspaces/hooks/use-workspace-slug";
import { cn } from "@/lib/utils";

import { buildNavItems } from "./nav";

export type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const slug = useWorkspaceSlugOptional();
  const navItems = slug ? buildNavItems(slug) : [];

  return (
    <aside
      className={cn(
        "h-full w-[272px] shrink-0 border-r border-border bg-surface/60 backdrop-blur-md",
        collapsed && "w-[84px]"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary shadow-glow-primary">
            <span className="text-sm font-semibold">F</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight text-foreground">
                FinnAI
              </div>
              <div className="text-xs text-muted">Inteligência Financeira</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-md border border-border bg-elevated/40 px-2 py-1 text-xs text-muted hover:bg-elevated"
          >
            Colapsar
          </button>
        )}
      </div>

      <nav className="px-2 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.section}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted transition-colors",
                    "hover:bg-elevated/60 hover:text-foreground",
                    active &&
                      "border-primary/40 bg-elevated/70 text-foreground shadow-[0_0_0_1px_rgba(53,224,161,0.25)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary/90 group-hover:text-primary" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3 pb-3">
        <div className={cn("rounded-xl border border-border bg-elevated/40 p-3", collapsed && "p-2")}>
          {!collapsed && (
            <>
              <div className="text-xs font-medium text-foreground">Plano Gratuito</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Upgrade para Pro</span>
                <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-bg">
                  Upgrade
                </span>
              </div>
            </>
          )}
          {collapsed && (
            <div className="grid place-items-center rounded-lg bg-primary/15 py-2 text-primary">
              <span className="text-xs font-semibold">Pro</span>
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-1">
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated/60 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4 text-muted" />
            {!collapsed && "Configurações"}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated/60 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <span className="grid h-4 w-4 place-items-center rounded border border-border text-[10px]">
              ↩
            </span>
            {!collapsed && "Sair"}
          </button>
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mt-3 w-full rounded-lg border border-border bg-elevated/40 py-2 text-xs text-muted hover:bg-elevated"
            aria-label="Expandir sidebar"
            title="Expandir sidebar"
          >
            Expandir
          </button>
        )}
      </div>
    </aside>
  );
}

