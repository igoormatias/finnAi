import { apiFetch } from "@/shared/api/client";

import { buildQuery } from "../finance-query";
import type {
  PaginatedResponse,
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionsFilters,
} from "../../types/finance-types";

export async function listTransactions(
  slug: string,
  filters: TransactionsFilters
): Promise<PaginatedResponse<Transaction>> {
  const query = buildQuery({
    limit: filters.limit,
    offset: filters.offset,
    sort: filters.sort,
    type: filters.type,
    category_id: filters.category_id,
    account_id: filters.account_id,
    start_date: filters.start_date,
    end_date: filters.end_date,
    amount_min_cents: filters.amount_min_cents,
    amount_max_cents: filters.amount_max_cents,
    recurring: filters.recurring,
    search: filters.search,
  });

  return apiFetch<PaginatedResponse<Transaction>>(`workspaces/${slug}/transactions${query}`);
}

export async function createTransaction(
  slug: string,
  input: TransactionCreateInput
): Promise<Transaction> {
  return apiFetch<Transaction>(`workspaces/${slug}/transactions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTransaction(
  slug: string,
  transactionId: string,
  input: TransactionUpdateInput
): Promise<Transaction> {
  return apiFetch<Transaction>(`workspaces/${slug}/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTransaction(slug: string, transactionId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/transactions/${transactionId}`, { method: "DELETE" });
}

