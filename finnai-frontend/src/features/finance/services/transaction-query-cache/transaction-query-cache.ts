import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { PaginatedResponse, Transaction } from "@/features/finance/types/finance-types";
import { queryKeys } from "@/shared/api/query-keys";

const DEFAULT_LIST_LIMIT = 20;

export function parseFiltersKey(key: string | undefined): Record<string, string> {
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

export function transactionMatchesFilters(
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
): boolean {
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

export function transactionFilterKey(queryKey: QueryKey): string | undefined {
  return typeof queryKey[3] === "string" ? queryKey[3] : undefined;
}

export function listTransactionQueryKeys(queryClient: QueryClient, slug: string): QueryKey[] {
  return queryClient
    .getQueryCache()
    .findAll({ queryKey: queryKeys.finance.transactionsRoot(slug) })
    .map((query) => query.queryKey);
}

function mergeCreatedIntoPage(
  prev: PaginatedResponse<Transaction> | undefined,
  created: Transaction
): PaginatedResponse<Transaction> {
  const limit = prev?.limit ?? DEFAULT_LIST_LIMIT;
  const offset = prev?.offset ?? 0;

  if (!prev) {
    return {
      total: 1,
      items: [created],
      limit,
      offset,
    };
  }

  const withoutDuplicate = prev.items.filter((item) => item.id !== created.id);
  const alreadyPresent = withoutDuplicate.length < prev.items.length;

  if (alreadyPresent) {
    return {
      ...prev,
      items: withoutDuplicate,
    };
  }

  return {
    ...prev,
    total: prev.total + 1,
    items: [created, ...withoutDuplicate].slice(0, limit),
  };
}

/** Seeds or merges a created transaction into all matching first-page list caches. */
export function upsertTransactionInListCaches(
  queryClient: QueryClient,
  slug: string,
  created: Transaction
): void {
  const keys = listTransactionQueryKeys(queryClient, slug);

  if (keys.length === 0) {
    const defaultKey = queryKeys.finance.transactions(
      slug,
      `limit=${DEFAULT_LIST_LIMIT}&offset=0&sort=newest`
    );
    queryClient.setQueryData<PaginatedResponse<Transaction>>(
      defaultKey,
      mergeCreatedIntoPage(undefined, created)
    );
    return;
  }

  for (const queryKey of keys) {
    const filterKey = transactionFilterKey(queryKey);
    if (!transactionMatchesFilters(created, filterKey)) continue;

    const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
    queryClient.setQueryData<PaginatedResponse<Transaction>>(
      queryKey,
      mergeCreatedIntoPage(prev, created)
    );
  }
}

/** Patches an updated transaction across matching list caches. */
export function patchTransactionInListCaches(
  queryClient: QueryClient,
  slug: string,
  transactionId: string,
  patch: Partial<Transaction>
): void {
  for (const queryKey of listTransactionQueryKeys(queryClient, slug)) {
    const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
    if (!prev) continue;

    const nextItems = prev.items.map((item) =>
      item.id === transactionId ? { ...item, ...patch } : item
    );
    const updated = nextItems.find((item) => item.id === transactionId);
    if (!updated || !transactionMatchesFilters(updated, transactionFilterKey(queryKey))) {
      const removed = nextItems.filter((item) => item.id !== transactionId);
      if (removed.length !== prev.items.length) {
        queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
          ...prev,
          total: Math.max(prev.total - 1, 0),
          items: removed,
        });
      }
      continue;
    }

    queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
      ...prev,
      items: nextItems,
    });
  }
}

/** Removes a transaction from matching list caches. */
export function removeTransactionFromListCaches(
  queryClient: QueryClient,
  slug: string,
  transactionId: string
): void {
  for (const queryKey of listTransactionQueryKeys(queryClient, slug)) {
    const prev = queryClient.getQueryData<PaginatedResponse<Transaction>>(queryKey);
    if (!prev) continue;

    const items = prev.items.filter((item) => item.id !== transactionId);
    if (items.length === prev.items.length) continue;

    queryClient.setQueryData<PaginatedResponse<Transaction>>(queryKey, {
      ...prev,
      total: Math.max(prev.total - 1, 0),
      items,
    });
  }
}

export async function invalidateFinanceWorkspace(
  queryClient: QueryClient,
  slug: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.transactionsRoot(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(slug) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.aiScore.detail(slug) }),
  ]);
}
