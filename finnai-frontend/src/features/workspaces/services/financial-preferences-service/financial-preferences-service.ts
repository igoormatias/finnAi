import type { FinancialPreferences } from "@/features/dashboard/types";
import { apiFetch } from "@/shared/api/client";

export async function getFinancialPreferences(slug: string): Promise<FinancialPreferences> {
  return apiFetch<FinancialPreferences>(`workspaces/${slug}/financial-preferences`);
}

export async function updateFinancialPreferences(
  slug: string,
  body: Partial<FinancialPreferences>
): Promise<FinancialPreferences> {
  return apiFetch<FinancialPreferences>(`workspaces/${slug}/financial-preferences`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
