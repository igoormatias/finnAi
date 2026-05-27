"use client";

import { useQuery } from "@tanstack/react-query";

import { getWorkspace } from "../../services/workspace-service";
import { useWorkspaceSlug } from "../use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useWorkspace() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.workspaces.detail(slug),
    queryFn: () => getWorkspace(slug),
    staleTime: 60_000,
  });
}
