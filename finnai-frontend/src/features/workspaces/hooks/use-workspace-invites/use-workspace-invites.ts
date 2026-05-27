"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cancelInvite, createInvite, listInvites } from "../../services/invites-service";
import { useWorkspacePermissions } from "../use-workspace-permissions";
import { useWorkspaceSlug } from "../use-workspace-slug";
import type { InviteCreateInput, WorkspaceInvite } from "../../types";
import { workspaceEventBus } from "@/shared/realtime/workspace-events";
import { queryKeys } from "@/shared/api/query-keys";

export function useWorkspaceInvites() {
  const slug = useWorkspaceSlug();
  const { can } = useWorkspacePermissions();

  return useQuery({
    queryKey: queryKeys.workspaces.invites(slug),
    queryFn: () => listInvites(slug),
    enabled: can("invite"),
    staleTime: 30_000,
  });
}

export function useInviteMember() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteCreateInput) => createInvite(slug, input),
    onSuccess: (invite) => {
      workspaceEventBus.emit({ type: "invite.created", payload: invite });
      toast.success("Convite enviado.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.invites(slug) });
    },
    onError: () => {
      toast.error("Não foi possível criar o convite.");
    },
  });
}

export function useCancelInvite() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => cancelInvite(slug, inviteId),
    onMutate: async (inviteId) => {
      const key = queryKeys.workspaces.invites(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WorkspaceInvite[]>(key);
      queryClient.setQueryData<WorkspaceInvite[]>(key, (old) => old?.filter((i) => i.id !== inviteId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.workspaces.invites(slug), ctx.previous);
      }
      toast.error("Não foi possível cancelar o convite.");
    },
    onSuccess: (_data, inviteId) => {
      workspaceEventBus.emit({ type: "invite.cancelled", payload: { id: inviteId } });
      toast.success("Convite cancelado.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.invites(slug) });
    },
  });
}
