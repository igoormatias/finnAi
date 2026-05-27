"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useWorkspaceSlugOptional } from "@/features/workspaces";
import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

import { buildNavItems } from "../nav";

export type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export const Sidebar = ({ collapsed, onToggleCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const slug = useWorkspaceSlugOptional();
  const navItems = slug ? buildNavItems(slug) : [];
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        "flex h-[calc(100dvh-2rem)] w-[272px] shrink-0 flex-col self-center overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-soft backdrop-blur-md transition-[width] duration-200 ease-out",
        collapsed && "w-[84px]"
      )}
    >
      <TooltipProvider>
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className={cn("flex items-center gap-2", collapsed && "w-full justify-center")}>
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary shadow-glow-primary">
              <span className="text-sm font-semibold">F</span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-tight text-foreground">FinnAI</div>
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
                  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-elevated/40 text-muted transition-colors hover:bg-elevated hover:text-foreground",
                  focusRingClass,
                  collapsed && "mx-auto"
                )}
                aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
              >
                <CollapseIcon className="h-4 w-4" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expandir" : "Colapsar"}</TooltipContent>
          </Tooltip>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Navegação principal">
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
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted transition-colors",
                          "hover:bg-elevated/60 hover:text-foreground",
                          focusRingClass,
                          active &&
                            "border-primary/40 bg-elevated/70 text-foreground shadow-[0_0_0_1px_rgba(53,224,161,0.25)]"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary/90 group-hover:text-primary" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border/60 px-3 pb-4 pt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => void signOut()}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated/60 hover:text-foreground",
                  focusRingClass,
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
      </TooltipProvider>
    </aside>
  );
};
