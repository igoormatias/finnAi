import type { WorkspaceMember, WorkspaceRole } from "../../types";

export type WorkspacePermission =
  | "invite"
  | "manageMembers"
  | "editWorkspace"
  | "deleteWorkspace"
  | "leaveWorkspace";

const ADMIN_ROLES: WorkspaceRole[] = ["owner", "admin"];

export function isAdminRole(role: WorkspaceRole | null | undefined): boolean {
  return role !== null && role !== undefined && ADMIN_ROLES.includes(role);
}

export function isOwnerRole(role: WorkspaceRole | null | undefined): boolean {
  return role === "owner";
}

export function canInvite(role: WorkspaceRole | null | undefined): boolean {
  return isAdminRole(role);
}

export function canEditWorkspace(role: WorkspaceRole | null | undefined): boolean {
  return isAdminRole(role);
}

export function canDeleteWorkspace(role: WorkspaceRole | null | undefined): boolean {
  return role === "owner";
}

export function canLeaveWorkspace(role: WorkspaceRole | null | undefined): boolean {
  return role !== null && role !== undefined && role !== "owner";
}

export function canEditMember(
  actorRole: WorkspaceRole | null | undefined,
  target: WorkspaceMember
): boolean {
  if (!actorRole || !isAdminRole(actorRole)) return false;
  if (target.role === "owner") return false;
  if (actorRole === "admin" && target.role === "admin") {
    return false;
  }
  return true;
}

export function canRemoveMember(
  actorRole: WorkspaceRole | null | undefined,
  target: WorkspaceMember,
  actorUserId: string
): boolean {
  if (!actorRole || !isAdminRole(actorRole)) return false;
  if (target.role === "owner") return false;
  if (target.user_id === actorUserId && actorRole === "owner") return false;
  if (actorRole === "admin" && target.role === "admin") return false;
  return true;
}

export function assignableRoles(actorRole: WorkspaceRole | null | undefined): WorkspaceRole[] {
  if (actorRole === "owner") return ["admin", "member", "viewer"];
  if (actorRole === "admin") return ["member", "viewer"];
  return [];
}

export function hasPermission(
  role: WorkspaceRole | null | undefined,
  permission: WorkspacePermission
): boolean {
  switch (permission) {
    case "invite":
      return canInvite(role);
    case "manageMembers":
      return isAdminRole(role);
    case "editWorkspace":
      return canEditWorkspace(role);
    case "deleteWorkspace":
      return canDeleteWorkspace(role);
    case "leaveWorkspace":
      return canLeaveWorkspace(role);
    default:
      return false;
  }
}

export function sortMembersByRole(members: WorkspaceMember[]): WorkspaceMember[] {
  const order: Record<WorkspaceRole, number> = {
    owner: 0,
    admin: 1,
    member: 2,
    viewer: 3,
  };
  return [...members].sort((a, b) => order[a.role] - order[b.role]);
}
