export type DashboardOverview = {
  total_balance_cents: number;
  monthly_income_cents: number;
  monthly_expense_cents: number;
  savings_cents: number;
  savings_rate: number;
  transaction_count: number;
  biggest_expense: { id: string; amount_cents: number; description: string } | null;
  biggest_income: { id: string; amount_cents: number; description: string } | null;
};

export type CashflowPoint = {
  bucket_start: string;
  income_cents: number;
  expense_cents: number;
  cumulative_balance_cents: number;
};

export type CashflowResponse = {
  granularity: "daily" | "weekly" | "monthly" | "yearly";
  points: CashflowPoint[];
};

export type CategoryAnalyticsItem = {
  category_id: string;
  name: string;
  total_cents: number;
  percent: number;
};

export type CategoryAnalyticsResponse = {
  type: "income" | "expense";
  items: CategoryAnalyticsItem[];
};

export type TrendsResponse = {
  current_income_cents: number;
  current_expense_cents: number;
  previous_income_cents: number;
  previous_expense_cents: number;
  income_growth_rate: number;
  expense_growth_rate: number;
};

export type AccountAnalyticsItem = {
  account_id: string;
  name: string;
  type: string;
  current_balance_cents: number;
  monthly_income_cents: number;
  monthly_expense_cents: number;
};

export type AccountsAnalyticsResponse = {
  items: AccountAnalyticsItem[];
};

export type TransactionPreview = {
  id: string;
  type: "income" | "expense";
  amount_cents: number;
  description: string;
  transaction_date: string;
};

export type PaginatedTransactions = {
  total: number;
  items: TransactionPreview[];
  limit: number;
  offset: number;
};

export type FinnAIScorePreview = {
  score: number;
  label: string;
  summary: string;
};

export type DateRangePreset = "7d" | "30d" | "1y";

export type DateRange = {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  granularity: CashflowResponse["granularity"];
};
