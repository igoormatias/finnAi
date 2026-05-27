"use client";

import { Check, ChevronsUpDown, Plus, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useWorkspacePermissions } from "@/features/workspaces";
import { useWorkspaceSwitcher } from "@/features/workspaces";
import { cn } from "@/lib/utils";
import { ROUTES, workspacePath } from "@/shared/config/routes";

function workspaceInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "W";
}

export const WorkspaceSwitcher = () => {
  const { slug, current, data: workspaces, isLoading, switchWorkspace } = useWorkspaceSwitcher();
  const { can } = useWorkspacePermissions();

  if (!slug) return null;

  if (isLoading) {
    return <Skeleton className="h-10 w-44 rounded-xl" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[220px] justify-between gap-2 border-border bg-elevated/40 px-2.5"
          aria-label="Trocar workspace"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
              {workspaceInitial(current?.name ?? slug)}
            </span>
            <span className="truncate">{current?.name ?? slug}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      >
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces?.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => switchWorkspace(workspace.slug)}
              className="flex items-center justify-between"
            >
              <span className="truncate">{workspace.name}</span>
              {workspace.slug === slug && <Check className={cn("h-4 w-4 text-primary")} />}
            </DropdownMenuItem>
          ))}
          {(workspaces?.length ?? 0) === 0 && (
            <DropdownMenuItem asChild>
              <Link href={ROUTES.onboarding} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar workspace
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={workspacePath(slug, "members")} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </Link>
          </DropdownMenuItem>
          {can("invite") && (
            <DropdownMenuItem asChild>
              <Link href={workspacePath(slug, "invites")} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Convites
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={workspacePath(slug, "settings")} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
