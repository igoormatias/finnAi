import type { WorkspaceRole } from "../../types";

export function roleLabel(role: WorkspaceRole): string {
  switch (role) {
    case "owner":
      return "Proprietário";
    case "admin":
      return "Editor financeiro";
    case "member":
      return "Membro";
    case "viewer":
      return "Apenas ver";
    default:
      return role;
  }
}

export function roleBadgeLabel(role: WorkspaceRole): string {
  switch (role) {
    case "owner":
      return "Acesso total";
    case "admin":
      return "Editor financeiro";
    case "member":
      return "Membro";
    case "viewer":
      return "Apenas ver";
    default:
      return role;
  }
}

export function roleSubtitle(role: WorkspaceRole): string {
  switch (role) {
    case "owner":
      return "Proprietário do workspace";
    case "admin":
      return "Editora";
    case "member":
      return "Membro";
    case "viewer":
      return "Visualizador";
    default:
      return "";
  }
}
