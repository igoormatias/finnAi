"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
} from "@/features/finance/services/accounts-service";
import type { Account, AccountCreateInput, AccountUpdateInput } from "@/features/finance/types/finance-types";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useAccounts() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.finance.accounts(slug),
    queryFn: () => listAccounts(slug),
    staleTime: 60_000,
  });
}

export function useCreateAccount() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AccountCreateInput) => createAccount(slug, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(slug) });
    },
  });
}

export function useUpdateAccount() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, input }: { accountId: string; input: AccountUpdateInput }) =>
      updateAccount(slug, accountId, input),
    onMutate: async ({ accountId, input }) => {
      const key = queryKeys.finance.accounts(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Account[]>(key);
      if (previous) {
        queryClient.setQueryData<Account[]>(
          key,
          previous.map((a) => (a.id === accountId ? { ...a, ...input } : a))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.finance.accounts(slug), ctx.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(slug) });
    },
  });
}

export function useDeleteAccount() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => deleteAccount(slug, accountId),
    onMutate: async (accountId) => {
      const key = queryKeys.finance.accounts(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Account[]>(key);
      if (previous) {
        queryClient.setQueryData<Account[]>(key, previous.filter((a) => a.id !== accountId));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.finance.accounts(slug), ctx.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(slug) });
    },
  });
}

