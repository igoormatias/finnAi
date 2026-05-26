import type {
  AccountsAnalyticsResponse,
  CashflowResponse,
  CategoryAnalyticsResponse,
  DashboardOverview,
  FinnAIScorePreview,
  PaginatedTransactions,
  TrendsResponse,
} from "@/features/dashboard/types";
import { apiFetch } from "@/shared/api/client";

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getDashboardOverview(slug: string): Promise<DashboardOverview> {
  return apiFetch<DashboardOverview>(`workspaces/${slug}/dashboard/overview`);
}

export async function getCashflow(
  slug: string,
  params: { startDate: string; endDate: string; granularity: string }
): Promise<CashflowResponse> {
  const query = buildQuery({
    start_date: params.startDate,
    end_date: params.endDate,
    granularity: params.granularity,
  });
  return apiFetch<CashflowResponse>(`workspaces/${slug}/dashboard/cashflow${query}`);
}

export async function getCategoryAnalytics(
  slug: string,
  params: { startDate: string; endDate: string; type?: "income" | "expense" }
): Promise<CategoryAnalyticsResponse> {
  const query = buildQuery({
    start_date: params.startDate,
    end_date: params.endDate,
    type: params.type ?? "expense",
  });
  return apiFetch<CategoryAnalyticsResponse>(
    `workspaces/${slug}/dashboard/categories${query}`
  );
}

export async function getTrends(slug: string): Promise<TrendsResponse> {
  return apiFetch<TrendsResponse>(`workspaces/${slug}/dashboard/trends`);
}

export async function getAccountsAnalytics(slug: string): Promise<AccountsAnalyticsResponse> {
  return apiFetch<AccountsAnalyticsResponse>(`workspaces/${slug}/dashboard/accounts`);
}

export async function getRecentTransactions(slug: string): Promise<PaginatedTransactions> {
  return apiFetch<PaginatedTransactions>(
    `workspaces/${slug}/transactions?limit=5&sort=newest`
  );
}

export async function getFinnAIScore(slug: string): Promise<FinnAIScorePreview> {
  return apiFetch<FinnAIScorePreview>(`workspaces/${slug}/ai/score`);
}
