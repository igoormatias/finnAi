export const ROUTES = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
} as const;

export type WorkspaceSection =
  | "dashboard"
  | "transactions"
  | "gastos"
  | "categories"
  | "accounts"
  | "score"
  | "metas"
  | "reports"
  | "relatorios"
  | "workspaces"
  | "members"
  | "invites"
  | "settings";

export function workspacePath(slug: string, section: WorkspaceSection = "dashboard"): string {
  return `/workspaces/${slug}/${section}`;
}

export function workspaceDashboardPath(slug: string): string {
  return workspacePath(slug, "dashboard");
}

export const GUEST_ROUTES = [ROUTES.home, ROUTES.login] as const;

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/gastos",
  "/score",
  "/metas",
  "/reports",
  "/relatorios",
  "/workspaces",
  "/onboarding",
  "/invites",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isGuestPath(pathname: string): boolean {
  return (GUEST_ROUTES as readonly string[]).includes(pathname);
}

export function getWorkspaceSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/workspaces\/([^/]+)/);
  return match?.[1] ?? null;
}

export function getWorkspaceSectionFromPath(pathname: string): WorkspaceSection | null {
  const match = pathname.match(/^\/workspaces\/[^/]+\/([^/]+)/);
  const section = match?.[1];
  const sections: WorkspaceSection[] = [
    "dashboard",
    "transactions",
    "gastos",
    "categories",
    "accounts",
    "score",
    "metas",
    "reports",
    "relatorios",
    "workspaces",
    "members",
    "invites",
    "settings",
  ];
  if (section && sections.includes(section as WorkspaceSection)) {
    return section as WorkspaceSection;
  }
  return null;
}
