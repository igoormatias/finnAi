import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import type { PaginatedResponse, Transaction } from "@/features/finance/types/finance-types";
import { queryKeys } from "@/shared/api/query-keys";

import {
  transactionMatchesFilters,
  upsertTransactionInListCaches,
} from "./transaction-query-cache";

const created: Transaction = {
  id: "tx-new",
  workspace_id: "ws-1",
  account_id: "acc-1",
  category_id: "cat-1",
  created_by: "user-1",
  type: "income",
  amount_cents: 250000,
  description: "Seguro",
  notes: null,
  transaction_date: "2026-05-27T00:00:00.000Z",
  is_recurring: false,
  recurrence_rule: null,
  created_at: "2026-05-27T12:00:01.000Z",
  updated_at: "2026-05-27T12:00:01.000Z",
};

describe("transactionMatchesFilters", () => {
  it("rejects income when filter type is expense", () => {
    expect(transactionMatchesFilters(created, "limit=20&offset=0&sort=newest&type=expense")).toBe(
      false
    );
  });

  it("accepts income on default first-page key", () => {
    expect(transactionMatchesFilters(created, "limit=20&offset=0&sort=newest")).toBe(true);
  });
});

describe("upsertTransactionInListCaches", () => {
  it("seeds default list cache when no queries exist", () => {
    const queryClient = new QueryClient();
    const slug = "familia-silva";

    upsertTransactionInListCaches(queryClient, slug, created);

    const key = queryKeys.finance.transactions(slug, "limit=20&offset=0&sort=newest");
    const cached = queryClient.getQueryData<PaginatedResponse<Transaction>>(key);
    expect(cached?.total).toBe(1);
    expect(cached?.items[0]?.id).toBe("tx-new");
  });

  it("merges into existing cache and increments total", () => {
    const queryClient = new QueryClient();
    const slug = "familia-silva";
    const key = queryKeys.finance.transactions(slug, "limit=20&offset=0&sort=newest");

    queryClient.setQueryData<PaginatedResponse<Transaction>>(key, {
      total: 1,
      items: [{ ...created, id: "tx-old" }],
      limit: 20,
      offset: 0,
    });

    upsertTransactionInListCaches(queryClient, slug, created);

    const cached = queryClient.getQueryData<PaginatedResponse<Transaction>>(key);
    expect(cached?.total).toBe(2);
    expect(cached?.items[0]?.id).toBe("tx-new");
  });

  it("does not upsert into expense-only cache for income transaction", () => {
    const queryClient = new QueryClient();
    const slug = "familia-silva";
    const expenseKey = queryKeys.finance.transactions(
      slug,
      "limit=20&offset=0&sort=newest&type=expense"
    );

    queryClient.setQueryData<PaginatedResponse<Transaction>>(expenseKey, {
      total: 0,
      items: [],
      limit: 20,
      offset: 0,
    });

    upsertTransactionInListCaches(queryClient, slug, created);

    const cached = queryClient.getQueryData<PaginatedResponse<Transaction>>(expenseKey);
    expect(cached?.total).toBe(0);
    expect(cached?.items).toHaveLength(0);
  });

  it("isolates caches by workspace slug", () => {
    const queryClient = new QueryClient();
    const keyA = queryKeys.finance.transactions("workspace-a", "limit=20&offset=0&sort=newest");
    const keyB = queryKeys.finance.transactions("workspace-b", "limit=20&offset=0&sort=newest");

    queryClient.setQueryData<PaginatedResponse<Transaction>>(keyB, {
      total: 0,
      items: [],
      limit: 20,
      offset: 0,
    });

    upsertTransactionInListCaches(queryClient, "workspace-a", created);

    expect(queryClient.getQueryData(keyA)?.items[0]?.id).toBe("tx-new");
    expect(queryClient.getQueryData(keyB)?.items).toHaveLength(0);
  });
});
