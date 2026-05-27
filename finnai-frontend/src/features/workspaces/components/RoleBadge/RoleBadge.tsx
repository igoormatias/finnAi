import { Badge } from "@/components/ui";
import type { WorkspaceRole } from "../../types";
import { roleBadgeLabel } from "../../utils/role-labels";
import { cn } from "@/lib/utils";

const variantByRole: Record<WorkspaceRole, "primary" | "success" | "default" | "warning"> = {
  owner: "primary",
  admin: "success",
  member: "default",
  viewer: "warning",
};

export const RoleBadge = ({ role, className }: { role: WorkspaceRole; className?: string }) => {
  return (
    <Badge variant={variantByRole[role]} className={cn("uppercase tracking-wide", className)}>
      {roleBadgeLabel(role)}
    </Badge>
  );
}
