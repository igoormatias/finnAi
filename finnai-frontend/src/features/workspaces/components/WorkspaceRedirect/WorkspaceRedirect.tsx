"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { LoadingState } from "@/components/states";
import { listWorkspaces } from "../../services/workspace-service";
import { queryKeys } from "@/shared/api/query-keys";
import { ROUTES, workspacePath } from "@/shared/config/routes";
import type { WorkspaceSection } from "@/shared/config/routes";

export const WorkspaceRedirect = ({
  section = "dashboard",
}: {
  section?: WorkspaceSection;
}) => {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: listWorkspaces,
  });

  useEffect(() => {
    if (isLoading) return;
    if (isError || !data?.length) {
      router.replace(ROUTES.onboarding);
      return;
    }
    const slug = data[0].slug;
    router.replace(workspacePath(slug, section));
  }, [data, isError, isLoading, router, section]);

  return (
    <div className="p-6">
      <LoadingState />
    </div>
  );
}
