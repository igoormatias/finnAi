import { apiFetch } from "@/shared/api/client";

import type { InviteCreateInput, WorkspaceInvite, WorkspaceMember } from "../../types";

export async function listInvites(slug: string): Promise<WorkspaceInvite[]> {
  return apiFetch<WorkspaceInvite[]>(`workspaces/${slug}/invites`);
}

export async function createInvite(slug: string, input: InviteCreateInput): Promise<WorkspaceInvite> {
  return apiFetch<WorkspaceInvite>(`workspaces/${slug}/invites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function cancelInvite(slug: string, inviteId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/invites/${inviteId}`, { method: "DELETE" });
}

export async function acceptInvite(token: string): Promise<WorkspaceMember> {
  return apiFetch<WorkspaceMember>(`invites/${token}/accept`, { method: "POST" });
}
