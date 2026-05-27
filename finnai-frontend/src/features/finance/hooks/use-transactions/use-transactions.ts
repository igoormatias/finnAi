"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/features/finance";
import { stableFiltersKey } from "@/features/finance";
import {
  invalidateFinanceWorkspace,
  patchTransactionInListCaches,
  removeTransactionFromListCaches,
  upsertTransactionInListCaches,
} from "@/features/finance/services/transaction-query-cache";
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsFilters,
} from "@/features/finance/types/finance-types";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

export function useTransactions(filters: TransactionsFilters) {
  const slug = useWorkspaceSlug();
  const key = stableFiltersKey(filters);
  const isFirstPage = (filters.offset ?? 0) === 0;

  return useQuery({
    queryKey: queryKeys.finance.transactions(slug, key),
    queryFn: () => listTransactions(slug, filters),
    placeholderData: isFirstPage ? undefined : (prev) => prev,
    staleTime: 15_000,
  });
}

export function useCreateTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionCreateInput) => createTransaction(slug, input),
    onSuccess: (created) => {
      upsertTransactionInListCaches(queryClient, slug, created);
    },
    onSettled: async () => {
      await invalidateFinanceWorkspace(queryClient, slug);
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
    onSuccess: (updated) => {
      patchTransactionInListCaches(queryClient, slug, updated.id, updated);
    },
    onSettled: async () => {
      await invalidateFinanceWorkspace(queryClient, slug);
    },
  });
}

export function useDeleteTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(slug, transactionId),
    onMutate: (transactionId) => {
      removeTransactionFromListCaches(queryClient, slug, transactionId);
    },
    onSettled: async () => {
      await invalidateFinanceWorkspace(queryClient, slug);
    },
  });
}
