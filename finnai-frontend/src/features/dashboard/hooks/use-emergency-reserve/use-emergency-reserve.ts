"use client";

import { useQuery } from "@tanstack/react-query";

import { getEmergencyReserve } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useEmergencyReserve() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.dashboard.emergencyReserve(slug),
    queryFn: () => getEmergencyReserve(slug),
    staleTime: 60_000,
  });
}
