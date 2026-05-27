import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";

vi.mock("@/features/workspaces", () => ({
  useWorkspaceSlug: () => "familia-silva",
  useWorkspaceSlugOptional: () => "familia-silva",
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    user: { name: "Maria Silva", email: "maria@test.com" },
    isLoading: false,
  }),
}));

vi.mock("@/features/dashboard", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/dashboard")>();
  return {
    ...actual,
    useDashboardOverview: () => ({ data: undefined, isLoading: true }),
    useTrendAnalytics: () => ({ data: undefined, isLoading: true }),
    useCashflow: () => ({ data: undefined, isLoading: true, isError: false }),
    useCategoryAnalytics: () => ({ data: undefined, isLoading: true, isError: false }),
    useAccountsAnalytics: () => ({ data: undefined, isLoading: true, isError: false }),
    useRecentTransactions: () => ({ data: undefined, isLoading: true, isError: false }),
    useFinnAIScore: () => ({ data: undefined, isLoading: true, isError: false }),
  };
});

vi.mock("next/dynamic", () => ({
  default: () => {
    return function DynamicMock() {
      return <div data-testid="chart-placeholder" />;
    };
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("DashboardPage", () => {
  it("renders greeting and range controls", () => {
    renderWithClient(<DashboardPage />);
    expect(screen.getByText(/Olá, Maria/)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /Período do dashboard/i })).toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
  });
});
