import type { WorkspaceInvite, WorkspaceMember } from "@/features/workspaces/types";

export type WorkspaceEvent =
  | { type: "member.joined"; payload: WorkspaceMember }
  | { type: "member.updated"; payload: WorkspaceMember }
  | { type: "member.removed"; payload: { id: string } }
  | { type: "invite.created"; payload: WorkspaceInvite }
  | { type: "invite.cancelled"; payload: { id: string } };

export interface WorkspaceEventBus {
  subscribe: (callback: (event: WorkspaceEvent) => void) => () => void;
  emit: (event: WorkspaceEvent) => void;
}

export function createWorkspaceEventBus(): WorkspaceEventBus {
  const listeners = new Set<(event: WorkspaceEvent) => void>();

  return {
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    emit(event) {
      listeners.forEach((listener) => listener(event));
    },
  };
}

export const workspaceEventBus = createWorkspaceEventBus();
