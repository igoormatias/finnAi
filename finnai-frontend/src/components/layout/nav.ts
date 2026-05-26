import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FolderKanban,
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
      section: "transactions",
      href: workspacePath(slug, "transactions"),
      label: "Gastos",
      icon: Wallet,
    },
    {
      section: "categories",
      href: workspacePath(slug, "categories"),
      label: "Categorias",
      icon: FolderKanban,
    },
    {
      section: "accounts",
      href: workspacePath(slug, "accounts"),
      label: "Contas",
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
