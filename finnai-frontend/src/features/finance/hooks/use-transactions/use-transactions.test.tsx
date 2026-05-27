import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedResponse, Transaction, TransactionCreateInput } from "../../types/finance-types";
import { queryKeys } from "@/shared/api/query-keys";
import { useCreateTransaction } from "./use-transactions";

const createTransactionMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/workspaces", () => ({
  useWorkspaceSlug: () => "familia-silva",
}));

vi.mock("@/features/finance", () => ({
  createTransaction: createTransactionMock,
  deleteTransaction: vi.fn(),
  listTransactions: vi.fn(),
  stableFiltersKey: (filters: Record<string, unknown>) =>
    Object.entries(filters)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join("&"),
  updateTransaction: vi.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreateTransaction", () => {
  it("adds the created transaction to the first page and invalidates dependent workspace queries", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const slug = "familia-silva";
    const filterKey = "limit=20&offset=0&sort=newest";
    const transactionsKey = queryKeys.finance.transactions(slug, filterKey);
    const overviewKey = queryKeys.dashboard.overview(slug);

    queryClient.setQueryData<PaginatedResponse<Transaction>>(transactionsKey, {
      total: 0,
      items: [],
      limit: 20,
      offset: 0,
    });
    queryClient.setQueryData(overviewKey, { total_balance_cents: 0 });

    const created: Transaction = {
      id: "tx-1",
      workspace_id: "workspace-1",
      account_id: "account-1",
      category_id: "category-1",
      created_by: "user-1",
      type: "expense",
      amount_cents: 1200,
      description: "Café",
      notes: null,
      transaction_date: "2026-05-27T12:00:00.000Z",
      is_recurring: false,
      recurrence_rule: null,
      created_at: "2026-05-27T12:00:01.000Z",
      updated_at: "2026-05-27T12:00:01.000Z",
    };
    createTransactionMock.mockResolvedValueOnce(created);

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    const input: TransactionCreateInput = {
      account_id: "account-1",
      category_id: "category-1",
      type: "expense",
      amount_cents: 1200,
      description: "Café",
      transaction_date: "2026-05-27T12:00:00.000Z",
      is_recurring: false,
      recurrence_rule: null,
    };

    await result.current.mutateAsync(input);

    await waitFor(() => {
      const cached = queryClient.getQueryData<PaginatedResponse<Transaction>>(transactionsKey);
      expect(cached?.items[0]).toMatchObject({ id: "tx-1", description: "Café" });
      expect(queryClient.getQueryState(overviewKey)?.isInvalidated).toBe(true);
    });
  });
});

