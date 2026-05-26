"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { LoadingState } from "@/components/states/loading-state";
import { listWorkspaces } from "@/features/workspaces/services/workspace-service";
import { queryKeys } from "@/shared/api/query-keys";
import { ROUTES, workspaceDashboardPath } from "@/shared/config/routes";

export function WorkspaceRedirect({ section = "dashboard" }: { section?: "dashboard" }) {
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
    if (section === "dashboard") {
      router.replace(workspaceDashboardPath(slug));
    }
  }, [data, isError, isLoading, router, section]);

  return (
    <div className="p-6">
      <LoadingState />
    </div>
  );
}
