"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteWorkspace,
  leaveWorkspace,
  updateWorkspace,
} from "../../services/workspace-service";
import { useWorkspaceSlug } from "../use-workspace-slug";
import type { WorkspaceUpdateInput } from "../../types";
import { ROUTES } from "@/shared/config/routes";
import { queryKeys } from "@/shared/api/query-keys";

export function useUpdateWorkspace() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkspaceUpdateInput) => updateWorkspace(slug, input),
    onSuccess: () => {
      toast.success("Workspace atualizado.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
    onError: () => toast.error("Não foi possível atualizar o workspace."),
  });
}

export function useDeleteWorkspace() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteWorkspace(slug),
    onSuccess: async () => {
      toast.success("Workspace excluído.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      router.push(ROUTES.onboarding);
      router.refresh();
    },
    onError: () => toast.error("Não foi possível excluir o workspace."),
  });
}

export function useLeaveWorkspace() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => leaveWorkspace(slug),
    onSuccess: async () => {
      toast.success("Você saiu do workspace.");
      const workspaces = await queryClient.fetchQuery({
        queryKey: queryKeys.workspaces.all,
        queryFn: async () => {
          const { listWorkspaces } = await import("@/features/workspaces");
          return listWorkspaces();
        },
      });
      const next = workspaces[0]?.slug;
      if (next) {
        router.push(`/workspaces/${next}/dashboard`);
      } else {
        router.push(ROUTES.onboarding);
      }
      router.refresh();
    },
    onError: () => toast.error("Não foi possível sair do workspace."),
  });
}
