import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Gauge,
  LayoutDashboard,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import type { WorkspaceSection } from "@/shared/config/routes";
import { workspacePath } from "@/shared/config/routes";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section: WorkspaceSection;
};

export function buildNavItems(slug: string): AppNavItem[] {
  return [
    {
      section: "dashboard",
      href: workspacePath(slug, "dashboard"),
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      section: "gastos",
      href: workspacePath(slug, "gastos"),
      label: "Gastos",
      icon: Wallet,
    },
    {
      section: "score",
      href: workspacePath(slug, "score"),
      label: "Score",
      icon: Gauge,
    },
    {
      section: "metas",
      href: workspacePath(slug, "metas"),
      label: "Metas",
      icon: Target,
    },
    {
      section: "relatorios",
      href: workspacePath(slug, "relatorios"),
      label: "Relatórios",
      icon: BarChart3,
    },
    {
      section: "workspaces",
      href: workspacePath(slug, "workspaces"),
      label: "Workspace Familiar",
      icon: Users,
    },
  ];
}
