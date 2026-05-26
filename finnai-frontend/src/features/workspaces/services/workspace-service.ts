import { apiFetch } from "@/shared/api/client";
import type { Workspace } from "@/features/workspaces/types";

export async function listWorkspaces(): Promise<Workspace[]> {
  return apiFetch<Workspace[]>("workspaces");
}

export async function createWorkspace(name: string): Promise<Workspace> {
  return apiFetch<Workspace>("workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
