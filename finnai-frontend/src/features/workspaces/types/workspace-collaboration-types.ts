export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
};

export type WorkspaceInvite = {
  id: string;
  workspace_id: string;
  invited_email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type WorkspaceUpdateInput = {
  name?: string;
  timezone?: string;
};

export type InviteCreateInput = {
  invited_email: string;
  role: Exclude<WorkspaceRole, "owner">;
};

export type MembershipRoleUpdateInput = {
  role: WorkspaceRole;
};

export type InviteStatus = "pending" | "accepted" | "expired";
