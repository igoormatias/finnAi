"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

import { listWorkspaces } from "../../services/workspace-service";
import { useWorkspaceSlugOptional } from "../use-workspace-slug";
import { useWorkspaceUiStore } from "@/features/workspaces/store/workspace-ui-store";
import { getWorkspaceSectionFromPath, workspacePath, type WorkspaceSection } from "@/shared/config/routes";
import { queryKeys } from "@/shared/api/query-keys";

export function useWorkspaceSwitcher() {
  const slug = useWorkspaceSlugOptional();
  const pathname = usePathname();
  const router = useRouter();
  const setLastWorkspaceSlug = useWorkspaceUiStore((s) => s.setLastWorkspaceSlug);

  const query = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: listWorkspaces,
  });

  const section: WorkspaceSection = getWorkspaceSectionFromPath(pathname) ?? "dashboard";
  const current = query.data?.find((w) => w.slug === slug);

  const switchWorkspace = (nextSlug: string) => {
    setLastWorkspaceSlug(nextSlug);
    router.push(workspacePath(nextSlug, section));
  };

  return {
    ...query,
    slug,
    section,
    current,
    switchWorkspace,
  };
}
