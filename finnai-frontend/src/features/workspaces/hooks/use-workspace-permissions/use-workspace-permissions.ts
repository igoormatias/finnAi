"use client";

import { useAuth } from "@/features/auth";
import { useWorkspaceMembers } from "../use-workspace-members";
import { useWorkspaceSlugOptional } from "../use-workspace-slug";
import type { WorkspaceRole } from "../../types";
import {
  assignableRoles,
  canEditMember,
  canRemoveMember,
  hasPermission,
  type WorkspacePermission,
} from "../../utils/permissions";

export function useWorkspacePermissions() {
  const { user } = useAuth();
  const slug = useWorkspaceSlugOptional();
  const { data: members, isLoading } = useWorkspaceMembers();

  if (!slug) {
    return {
      isLoading: false,
      currentRole: null,
      currentMembership: null,
      can: () => false,
      canEditMember: () => false,
      canRemoveMember: () => false,
      assignableRoles: [] as const,
    };
  }

  const currentMembership = members?.find((m) => m.user_id === user?.id) ?? null;
  const currentRole = (currentMembership?.role ?? null) as WorkspaceRole | null;

  return {
    isLoading,
    currentRole,
    currentMembership,
    can: (permission: WorkspacePermission) => hasPermission(currentRole, permission),
    canEditMember: (targetId: string) => {
      const target = members?.find((m) => m.id === targetId);
      if (!target || !user?.id) return false;
      return canEditMember(currentRole, target);
    },
    canRemoveMember: (targetId: string) => {
      const target = members?.find((m) => m.id === targetId);
      if (!target || !user?.id) return false;
      return canRemoveMember(currentRole, target, user.id);
    },
    assignableRoles: assignableRoles(currentRole),
  };
}
