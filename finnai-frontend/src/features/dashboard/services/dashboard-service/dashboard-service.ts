import type {
  AccountsAnalyticsResponse,
  CashflowResponse,
  CategoryAnalyticsResponse,
  DashboardOverview,
  EmergencyReserve,
  MonthlyExpensePoint,
  PaginatedTransactions,
  ProjectedCashflowResponse,
  ReportMode,
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

export async function getDashboardOverview(
  slug: string,
  period?: string
): Promise<DashboardOverview> {
  const query = period ? buildQuery({ period }) : "";
  return apiFetch<DashboardOverview>(`workspaces/${slug}/dashboard/overview${query}`);
}

export async function getCashflow(
  slug: string,
  params: { startDate: string; endDate: string; granularity: string; period?: string }
): Promise<CashflowResponse> {
  const query = buildQuery({
    start_date: params.startDate,
    end_date: params.endDate,
    granularity: params.granularity,
    period: params.period,
  });
  return apiFetch<CashflowResponse>(`workspaces/${slug}/dashboard/cashflow${query}`);
}

export async function getProjectedCashflow(
  slug: string,
  params: {
    startDate: string;
    endDate: string;
    granularity: string;
    mode: "projected" | "combined";
    period?: string;
  }
): Promise<ProjectedCashflowResponse> {
  const query = buildQuery({
    start_date: params.startDate,
    end_date: params.endDate,
    granularity: params.granularity,
    period: params.period,
  });
  const path =
    params.mode === "combined"
      ? `workspaces/${slug}/dashboard/cashflow/combined`
      : `workspaces/${slug}/dashboard/cashflow/projected`;
  return apiFetch<ProjectedCashflowResponse>(`${path}${query}`);
}

export async function getCategoryAnalytics(
  slug: string,
  params: { startDate: string; endDate: string; type?: "income" | "expense"; period?: string }
): Promise<CategoryAnalyticsResponse> {
  const query = buildQuery({
    start_date: params.startDate,
    end_date: params.endDate,
    type: params.type ?? "expense",
    period: params.period,
  });
  return apiFetch<CategoryAnalyticsResponse>(
    `workspaces/${slug}/dashboard/categories${query}`
  );
}

export async function getTrends(slug: string, period?: string): Promise<TrendsResponse> {
  const query = period ? buildQuery({ period }) : "";
  return apiFetch<TrendsResponse>(`workspaces/${slug}/dashboard/trends${query}`);
}

export async function getAccountsAnalytics(slug: string): Promise<AccountsAnalyticsResponse> {
  return apiFetch<AccountsAnalyticsResponse>(`workspaces/${slug}/dashboard/accounts`);
}

export async function getEmergencyReserve(slug: string): Promise<EmergencyReserve> {
  return apiFetch<EmergencyReserve>(`workspaces/${slug}/dashboard/emergency-reserve`);
}

export async function getMonthlyExpenses(slug: string): Promise<{ items: MonthlyExpensePoint[] }> {
  return apiFetch<{ items: MonthlyExpensePoint[] }>(
    `workspaces/${slug}/dashboard/monthly-expenses`
  );
}

export async function getRecentTransactions(slug: string): Promise<PaginatedTransactions> {
  return apiFetch<PaginatedTransactions>(
    `workspaces/${slug}/transactions?limit=5&sort=newest`
  );
}

export type { ReportMode };
