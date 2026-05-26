"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { listWorkspaces } from "@/features/workspaces/services/workspace-service";
import { useWorkspaceSlugOptional } from "@/features/workspaces/hooks/use-workspace-slug";
import { cn } from "@/lib/utils";
import {
  getWorkspaceSectionFromPath,
  workspacePath,
} from "@/shared/config/routes";
import { queryKeys } from "@/shared/api/query-keys";

export function WorkspaceSwitcher() {
  const slug = useWorkspaceSlugOptional();
  const pathname = usePathname();
  const router = useRouter();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: listWorkspaces,
  });

  const current = workspaces?.find((w) => w.slug === slug);

  if (!slug) return null;

  if (isLoading) {
    return <Skeleton className="h-10 w-40 rounded-xl" />;
  }

  const section = getWorkspaceSectionFromPath(pathname) ?? "dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[200px] justify-between gap-2 border-border bg-elevated/40"
          aria-label="Trocar workspace"
        >
          <span className="truncate">{current?.name ?? slug}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {workspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(workspacePath(workspace.slug, section))}
            className="flex items-center justify-between"
          >
            <span className="truncate">{workspace.name}</span>
            {workspace.slug === slug && <Check className={cn("h-4 w-4 text-primary")} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
