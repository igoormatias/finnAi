"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useWorkspaceSlugOptional } from "@/features/workspaces";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

import { buildNavItems } from "../nav";

export type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
};

export const Sidebar = ({ collapsed, onToggleCollapsed, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const slug = useWorkspaceSlugOptional();
  const navItems = slug ? buildNavItems(slug) : [];
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        "h-full w-[272px] shrink-0 border-r border-border bg-surface/60 backdrop-blur-md transition-[width] duration-200 ease-out",
        collapsed && "w-[84px]"
      )}
    >
      <TooltipProvider>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleCollapsed}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated/40 text-muted transition-colors hover:bg-elevated hover:text-foreground cursor-pointer",
                collapsed && "mx-auto"
              )}
              aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              <CollapseIcon className="h-4 w-4" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expandir" : "Colapsar"}
          </TooltipContent>
        </Tooltip>
      </div>

      <nav className="px-2 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.section}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted transition-colors cursor-pointer",
                        "hover:bg-elevated/60 hover:text-foreground",
                        active &&
                          "border-primary/40 bg-elevated/70 text-foreground shadow-[0_0_0_1px_rgba(53,224,161,0.25)]"
                      )}
                      aria-label={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary/90 group-hover:text-primary" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3 pb-3">
        <div className="mt-3 grid gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => void signOut()}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated/60 hover:text-foreground cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
                aria-label={collapsed ? "Sair" : undefined}
              >
                <LogOut className="h-4 w-4 text-muted" aria-hidden />
                {!collapsed && "Sair"}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
          </Tooltip>
        </div>
      </div>
      </TooltipProvider>
    </aside>
  );
}

