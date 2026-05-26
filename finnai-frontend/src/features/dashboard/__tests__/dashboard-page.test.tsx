import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

vi.mock("@/features/workspaces/hooks/use-workspace-slug", () => ({
  useWorkspaceSlug: () => "familia-silva",
  useWorkspaceSlugOptional: () => "familia-silva",
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { name: "Maria Silva", email: "maria@test.com" },
    isLoading: false,
  }),
}));

vi.mock("@/features/dashboard/hooks/use-dashboard-overview", () => ({
  useDashboardOverview: () => ({ data: undefined, isLoading: true }),
}));

vi.mock("@/features/dashboard/hooks/use-trend-analytics", () => ({
  useTrendAnalytics: () => ({ data: undefined, isLoading: true }),
}));

vi.mock("@/features/dashboard/hooks/use-cashflow", () => ({
  useCashflow: () => ({ data: undefined, isLoading: true, isError: false }),
}));

vi.mock("@/features/dashboard/hooks/use-category-analytics", () => ({
  useCategoryAnalytics: () => ({ data: undefined, isLoading: true, isError: false }),
}));

vi.mock("@/features/dashboard/hooks/use-accounts-analytics", () => ({
  useAccountsAnalytics: () => ({ data: undefined, isLoading: true, isError: false }),
}));

vi.mock("@/features/dashboard/hooks/use-recent-transactions", () => ({
  useRecentTransactions: () => ({ data: undefined, isLoading: true, isError: false }),
}));

vi.mock("@/features/dashboard/hooks/use-finnai-score", () => ({
  useFinnAIScore: () => ({ data: undefined, isLoading: true, isError: false }),
}));

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
