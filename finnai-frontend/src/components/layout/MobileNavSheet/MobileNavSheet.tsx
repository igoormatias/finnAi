"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useWorkspaceSlugOptional } from "@/features/workspaces";
import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";

import { buildNavItems } from "../nav";

export type MobileNavSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MobileNavSheet = ({ open, onOpenChange }: MobileNavSheetProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const slug = useWorkspaceSlugOptional();
  const navItems = slug ? buildNavItems(slug) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle>FinnAI</SheetTitle>
          <SheetDescription>Navegação principal</SheetDescription>
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          aria-label="Navegação principal"
        >
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.section}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors",
                      "hover:bg-elevated/60 hover:text-foreground",
                      focusRingClass,
                      active &&
                        "border border-primary/40 bg-elevated/70 text-foreground shadow-[0_0_0_1px_rgba(53,224,161,0.25)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void signOut()}
            className={cn(
              "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-elevated/60 hover:text-foreground",
              focusRingClass
            )}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
