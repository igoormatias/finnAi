import { apiFetch } from "@/shared/api/client";

import type { Category, CategoryCreateInput, CategoryUpdateInput } from "../types/finance-types";

export async function listCategories(slug: string): Promise<Category[]> {
  return apiFetch<Category[]>(`workspaces/${slug}/categories`);
}

export async function createCategory(slug: string, input: CategoryCreateInput): Promise<Category> {
  return apiFetch<Category>(`workspaces/${slug}/categories`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  slug: string,
  categoryId: string,
  input: CategoryUpdateInput
): Promise<Category> {
  return apiFetch<Category>(`workspaces/${slug}/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(slug: string, categoryId: string): Promise<void> {
  return apiFetch<void>(`workspaces/${slug}/categories/${categoryId}`, { method: "DELETE" });
}

