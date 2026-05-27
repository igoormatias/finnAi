"use client";

import type { ReactNode } from "react";

import { useWorkspacePermissions } from "../../hooks/use-workspace-permissions";
import type { WorkspacePermission } from "../../utils/permissions";

export const Can = ({
  permission,
  children,
  fallback = null,
}: {
  permission: WorkspacePermission;
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const { can, isLoading } = useWorkspacePermissions();
  if (isLoading) return null;
  if (!can(permission)) return fallback;
  return children;
}
