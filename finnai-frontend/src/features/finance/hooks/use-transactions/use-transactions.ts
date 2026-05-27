"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { nanoid } from "nanoid/non-secure";

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/features/finance";
import { stableFiltersKey } from "@/features/finance";
import type {
  PaginatedResponse,
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsFilters,
} from "@/features/finance/types/finance-types";
import { useWorkspaceSlug } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";

function parseFiltersKey(key: string | undefined): Record<string, string> {
  if (!key) return {};
  return Object.fromEntries(
    key
      .split("&")
      .filter(Boolean)
      .map((entry) => {
        const [rawKey, ...rawValue] = entry.split("=");
        return [rawKey, rawValue.join("=")] as const;
      })
  );
}

function transactionMatchesFilters(
  transaction: Pick<
    Transaction,
    | "account_id"
    | "amount_cents"
    | "category_id"
    | "description"
    | "is_recurring"
    | "notes"
    | "transaction_date"
    | "type"
  >,
  filterKey: string | undefined
) {
  const filters = parseFiltersKey(filterKey);

  if (filters.offset && filters.offset !== "0") return false;
  if (filters.sort && filters.sort !== "newest") return false;
  if (filters.type && filters.type !== transaction.type) return false;
  if (filters.category_id && filters.category_id !== transaction.category_id) return false;
  if (filters.account_id && filters.account_id !== transaction.account_id) return false;
  if (filters.recurring && filters.recurring !== String(transaction.is_recurring)) return false;
  if (filters.amount_min_cents && transaction.amount_cents < Number(filters.amount_min_cents)) {
    return false;
  }
  if (filters.amount_max_cents && transaction.amount_cents > Number(filters.amount_max_cents)) {
    return false;
  }
  if (filters.start_date && transaction.transaction_date < filters.start_date) return false;
  if (filters.end_date && transaction.transaction_date > filters.end_date) return false;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const haystack = `${transaction.description} ${transaction.notes ?? ""}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  return true;
}

function transactionFilterKey(queryKey: QueryKey): string | undefined {
  return typeof queryKey[3] === "string" ? queryKey[3] : undefined;
}

function transactionQueryKeys(queryClient: QueryClient, slug: string) {
  return queryClient
    .getQueryCache()
    .findAll({ queryKey: queryKeys.finance.transactionsRoot(slug) })
    .map((query) => query.queryKey);
}

async function invalidateTransactionDependencies(queryClient: QueryClient, slug: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactionsRoot(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.aiScore.detail(slug) }),
  ]);
}

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
      const partialKeys = transactionQueryKeys(queryClient, slug);
      const optimisticId = `optimistic_${nanoid()}`;

      await Promise.all(partialKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })));

      const optimistic: Transaction = {
        id: optimisticId,
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
        if (prev && transactionMatchesFilters(optimistic, transactionFilterKey(queryKey))) {
          queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
            ...prev,
            total: prev.total + 1,
            items: [optimistic, ...prev.items],
          });
        }
        return { queryKey, prev, optimisticId };
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ queryKey, prev }) => {
        if (prev) queryClient.setQueryData(queryKey, prev);
      });
    },
    onSuccess: (created, _input, ctx) => {
      ctx?.snapshots?.forEach(({ queryKey, optimisticId }) => {
        if (!transactionMatchesFilters(created, transactionFilterKey(queryKey))) return;
        queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, (prev) => {
          if (!prev) return prev;
          const withoutOptimistic = prev.items.filter((item) => item.id !== optimisticId);
          if (withoutOptimistic.some((item) => item.id === created.id)) {
            return { ...prev, items: withoutOptimistic };
          }
          return {
            ...prev,
            items: [created, ...withoutOptimistic].slice(0, prev.limit),
          };
        });
      });
    },
    onSettled: async () => {
      await invalidateTransactionDependencies(queryClient, slug);
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
      const partialKeys = transactionQueryKeys(queryClient, slug);

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
      await invalidateTransactionDependencies(queryClient, slug);
    },
  });
}

export function useDeleteTransaction() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(slug, transactionId),
    onMutate: async (transactionId) => {
      const partialKeys = transactionQueryKeys(queryClient, slug);

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
      await invalidateTransactionDependencies(queryClient, slug);
    },
  });
}

