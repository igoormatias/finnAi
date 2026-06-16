import type { DateRangePreset } from "@/features/dashboard/types";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    detail: (slug: string) => ["workspaces", slug, "detail"] as const,
    members: (slug: string) => ["workspaces", slug, "members"] as const,
    invites: (slug: string) => ["workspaces", slug, "invites"] as const,
    financialPreferences: (slug: string) => ["workspaces", slug, "financial-preferences"] as const,
  },
  dashboard: {
    all: (slug: string) => ["dashboard", slug] as const,
    overview: (slug: string, preset?: string) =>
      ["dashboard", slug, "overview", preset ?? "default"] as const,
    cashflow: (slug: string, preset: DateRangePreset, mode?: string) =>
      ["dashboard", slug, "cashflow", preset, mode ?? "historical"] as const,
    categories: (slug: string, preset: DateRangePreset) =>
      ["dashboard", slug, "categories", preset] as const,
    trends: (slug: string, preset?: string) =>
      ["dashboard", slug, "trends", preset ?? "default"] as const,
    accounts: (slug: string) => ["dashboard", slug, "accounts"] as const,
    transactions: (slug: string) => ["dashboard", slug, "transactions"] as const,
    score: (slug: string) => ["dashboard", slug, "score"] as const,
    emergencyReserve: (slug: string) => ["dashboard", slug, "emergency-reserve"] as const,
    monthlyExpenses: (slug: string) => ["dashboard", slug, "monthly-expenses"] as const,
  },
  finance: {
    categories: (slug: string) => ["finance", slug, "categories"] as const,
    accounts: (slug: string) => ["finance", slug, "accounts"] as const,
    transactionsRoot: (slug: string) => ["finance", slug, "transactions"] as const,
    transactions: (slug: string, key: string) => ["finance", slug, "transactions", key] as const,
    transaction: (slug: string, id: string) => ["finance", slug, "transaction", id] as const,
  },
  aiScore: {
    detail: (slug: string) => ["ai-score", slug] as const,
  },
  goals: {
    list: (slug: string) => ["goals", slug, "list"] as const,
    overview: (slug: string) => ["goals", slug, "overview"] as const,
    contributions: (slug: string, goalId: string) =>
      ["goals", slug, goalId, "contributions"] as const,
  },
} as const;
