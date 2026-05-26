import type { DateRangePreset } from "@/features/dashboard/types";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
  },
  dashboard: {
    overview: (slug: string) => ["dashboard", slug, "overview"] as const,
    cashflow: (slug: string, preset: DateRangePreset) =>
      ["dashboard", slug, "cashflow", preset] as const,
    categories: (slug: string, preset: DateRangePreset) =>
      ["dashboard", slug, "categories", preset] as const,
    trends: (slug: string) => ["dashboard", slug, "trends"] as const,
    accounts: (slug: string) => ["dashboard", slug, "accounts"] as const,
    transactions: (slug: string) => ["dashboard", slug, "transactions"] as const,
    score: (slug: string) => ["dashboard", slug, "score"] as const,
  },
  finance: {
    categories: (slug: string) => ["finance", slug, "categories"] as const,
    accounts: (slug: string) => ["finance", slug, "accounts"] as const,
    transactions: (slug: string, key: string) => ["finance", slug, "transactions", key] as const,
    transaction: (slug: string, id: string) => ["finance", slug, "transaction", id] as const,
  },
} as const;
