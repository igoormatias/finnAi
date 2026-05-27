"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listMembers, removeMember, updateMemberRole } from "../../services/members-service";
import { useWorkspaceSlugOptional } from "../use-workspace-slug";
import type { MembershipRoleUpdateInput, WorkspaceMember } from "../../types";
import { sortMembersByRole } from "../../utils/permissions";
import { workspaceEventBus } from "@/shared/realtime/workspace-events";
import { queryKeys } from "@/shared/api/query-keys";

export function useWorkspaceMembers() {
  const slug = useWorkspaceSlugOptional();
  return useQuery({
    queryKey: queryKeys.workspaces.members(slug ?? ""),
    queryFn: () => listMembers(slug!),
    enabled: Boolean(slug),
    select: sortMembersByRole,
    staleTime: 30_000,
  });
}

export function useUpdateMemberRole() {
  const slug = useWorkspaceSlugOptional();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: MembershipRoleUpdateInput }) => {
      if (!slug) throw new Error("Workspace slug is required");
      return updateMemberRole(slug, memberId, input);
    },
    onMutate: async ({ memberId, input }) => {
      if (!slug) return { previous: undefined };
      const key = queryKeys.workspaces.members(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(key);
      queryClient.setQueryData<WorkspaceMember[]>(key, (old) =>
        old?.map((m) => (m.id === memberId ? { ...m, role: input.role } : m))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (slug && ctx?.previous) {
        queryClient.setQueryData(queryKeys.workspaces.members(slug), ctx.previous);
      }
      toast.error("Não foi possível atualizar o papel do membro.");
    },
    onSuccess: (member) => {
      // TODO: replace with WebSocket push
      workspaceEventBus.emit({ type: "member.updated", payload: member });
      toast.success("Papel atualizado.");
    },
    onSettled: () => {
      if (slug) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(slug) });
      }
    },
  });
}

export function useRemoveMember() {
  const slug = useWorkspaceSlugOptional();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!slug) throw new Error("Workspace slug is required");
      return removeMember(slug, memberId);
    },
    onMutate: async (memberId) => {
      if (!slug) return { previous: undefined };
      const key = queryKeys.workspaces.members(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(key);
      queryClient.setQueryData<WorkspaceMember[]>(key, (old) => old?.filter((m) => m.id !== memberId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (slug && ctx?.previous) {
        queryClient.setQueryData(queryKeys.workspaces.members(slug), ctx.previous);
      }
      toast.error("Não foi possível remover o membro.");
    },
    onSuccess: (_data, memberId) => {
      workspaceEventBus.emit({ type: "member.removed", payload: { id: memberId } });
      toast.success("Membro removido.");
    },
    onSettled: () => {
      if (slug) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(slug) });
      }
    },
  });
}
