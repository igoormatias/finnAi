import { apiFetch } from "@/shared/api/client";

import type { MembershipRoleUpdateInput, WorkspaceMember } from "../../types";

export async function listMembers(slug: string): Promise<WorkspaceMember[]> {
  return apiFetch<WorkspaceMember[]>(`workspaces/${slug}/members`);
}

export async function updateMemberRole(
  slug: string,
  memberId: string,
  input: MembershipRoleUpdateInput
): Promise<WorkspaceMember> {
  return apiFetch<WorkspaceMember>(`workspaces/${slug}/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeMember(slug: string, memberId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/members/${memberId}`, { method: "DELETE" });
}
