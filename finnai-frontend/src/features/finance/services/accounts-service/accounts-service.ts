import { apiFetch } from "@/shared/api/client";

import type { Account, AccountCreateInput, AccountUpdateInput } from "../../types/finance-types";

export async function listAccounts(slug: string): Promise<Account[]> {
  return apiFetch<Account[]>(`workspaces/${slug}/accounts`);
}

export async function createAccount(slug: string, input: AccountCreateInput): Promise<Account> {
  return apiFetch<Account>(`workspaces/${slug}/accounts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAccount(
  slug: string,
  accountId: string,
  input: AccountUpdateInput
): Promise<Account> {
  return apiFetch<Account>(`workspaces/${slug}/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAccount(slug: string, accountId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/accounts/${accountId}`, { method: "DELETE" });
}

