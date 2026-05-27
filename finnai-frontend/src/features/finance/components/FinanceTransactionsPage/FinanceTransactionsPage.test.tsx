import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FinanceTransactionsPage } from "./FinanceTransactionsPage";

vi.mock("@/features/workspaces", () => ({
  useWorkspaceSlug: () => "familia-silva",
  useWorkspaceSlugOptional: () => "familia-silva",
}));

vi.mock("@/features/finance", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/finance")>();
  return {
    ...actual,
    useCategories: () => ({
      data: [
        {
          id: "c1",
          name: "Alimentação",
          type: "expense",
          color: "#35e0a1",
          icon: "tag",
          is_fixed: false,
        },
      ],
      isError: false,
    }),
    useCreateCategory: () => ({}),
    useUpdateCategory: () => ({}),
    useDeleteCategory: () => ({}),
    useAccounts: () => ({
      data: [
        {
          id: "a1",
          name: "Nubank",
          type: "checking",
          initial_balance_cents: 0,
          current_balance_cents: 0,
        },
      ],
      isError: false,
      isLoading: false,
    }),
    useCreateAccount: () => ({}),
    useUpdateAccount: () => ({}),
    useDeleteAccount: () => ({}),
    useTransactions: () => ({
      data: { total: 0, items: [], limit: 20, offset: 0 },
      isLoading: false,
      isError: false,
    }),
    useCreateTransaction: () => ({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }),
    useUpdateTransaction: () => ({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }),
    useDeleteTransaction: () => ({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <FinanceTransactionsPage />
    </QueryClientProvider>
  );
}

describe("FinanceTransactionsPage", () => {
  it("renders header and empty state row", () => {
    renderWithClient();
    expect(screen.getByText(/Gestão de gastos/i)).toBeInTheDocument();
    expect(screen.getByText(/Sem transações/i)).toBeInTheDocument();
  });
});
