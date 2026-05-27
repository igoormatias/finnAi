import type { InviteStatus, WorkspaceInvite } from "../../types";

export function getInviteStatus(invite: WorkspaceInvite, now = new Date()): InviteStatus {
  if (invite.accepted_at) return "accepted";
  if (new Date(invite.expires_at) <= now) return "expired";
  return "pending";
}

export function inviteStatusLabel(status: InviteStatus): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "accepted":
      return "Aceito";
    case "expired":
      return "Expirado";
    default:
      return status;
  }
}
