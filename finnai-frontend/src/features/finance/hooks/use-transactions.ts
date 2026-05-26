"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid/non-secure";

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/features/finance/services/transactions-service";
import { stableFiltersKey } from "@/features/finance/services/finance-query";
import type {
  PaginatedResponse,
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsFilters,
} from "@/features/finance/types/finance-types";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useTransactions(filters: TransactionsFilters) {
  const slug = useWorkspaceSlug();
  const key = stableFiltersKey(filters);

  return useQuery({
    queryKey: queryKeys.finance.transactions(slug, key),
    queryFn: () => listTransactions(slug, filters),
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  });
}

export function useCreateTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionCreateInput) => createTransaction(slug, input),
    onMutate: async (input) => {
      const partialKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["finance", slug, "transactions"] })
        .map((q) => q.queryKey);

      await Promise.all(partialKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })));

      const optimistic: Transaction = {
        id: `optimistic_${nanoid()}`,
        workspace_id: "optimistic",
        account_id: input.account_id,
        category_id: input.category_id,
        created_by: "optimistic",
        type: input.type,
        amount_cents: input.amount_cents,
        description: input.description ?? "",
        notes: input.notes ?? null,
        transaction_date: input.transaction_date,
        is_recurring: input.is_recurring ?? false,
        recurrence_rule: input.recurrence_rule ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const snapshots = partialKeys.map((queryKey) => {
        const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
        if (prev) {
          queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
            ...prev,
            total: prev.total + 1,
            items: [optimistic, ...prev.items],
          });
        }
        return { queryKey, prev };
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ queryKey, prev }) => {
        if (prev) queryClient.setQueryData(queryKey, prev);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance", slug, "transactions"] });
    },
  });
}

export function useUpdateTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string;
      input: TransactionUpdateInput;
    }) => updateTransaction(slug, transactionId, input),
    onMutate: async ({ transactionId, input }) => {
      const partialKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["finance", slug, "transactions"] })
        .map((q) => q.queryKey);

      await Promise.all(partialKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })));

      const snapshots = partialKeys.map((queryKey) => {
        const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
        if (prev) {
          queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
            ...prev,
            items: prev.items.map((t) => (t.id === transactionId ? { ...t, ...input } : t)),
          });
        }
        return { queryKey, prev };
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ queryKey, prev }) => {
        if (prev) queryClient.setQueryData(queryKey, prev);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance", slug, "transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(slug, transactionId),
    onMutate: async (transactionId) => {
      const partialKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["finance", slug, "transactions"] })
        .map((q) => q.queryKey);

      await Promise.all(partialKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })));

      const snapshots = partialKeys.map((queryKey) => {
        const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
        if (prev) {
          queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
            ...prev,
            total: Math.max(prev.total - 1, 0),
            items: prev.items.filter((t) => t.id !== transactionId),
          });
        }
        return { queryKey, prev };
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ queryKey, prev }) => {
        if (prev) queryClient.setQueryData(queryKey, prev);
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance", slug, "transactions"] });
    },
  });
}

