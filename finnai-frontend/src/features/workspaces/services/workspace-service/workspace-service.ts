import { apiFetch } from "@/shared/api/client";

import type { Workspace, WorkspaceUpdateInput } from "../../types";

export async function listWorkspaces(): Promise<Workspace[]> {
  return apiFetch<Workspace[]>("workspaces");
}

export async function createWorkspace(name: string): Promise<Workspace> {
  return apiFetch<Workspace>("workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getWorkspace(slug: string): Promise<Workspace> {
  return apiFetch<Workspace>(`workspaces/${slug}`);
}

export async function updateWorkspace(slug: string, input: WorkspaceUpdateInput): Promise<Workspace> {
  return apiFetch<Workspace>(`workspaces/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteWorkspace(slug: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}`, { method: "DELETE" });
}

export async function leaveWorkspace(slug: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/members/leave`, { method: "POST" });
}
