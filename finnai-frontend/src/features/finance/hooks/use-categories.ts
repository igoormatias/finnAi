"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/features/finance/services/categories-service";
import type { Category, CategoryCreateInput, CategoryUpdateInput } from "@/features/finance/types/finance-types";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function useCategories() {
  const slug = useWorkspaceSlug();
  return useQuery({
    queryKey: queryKeys.finance.categories(slug),
    queryFn: () => listCategories(slug),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryCreateInput) => createCategory(slug, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.categories(slug) });
    },
  });
}

export function useUpdateCategory() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: CategoryUpdateInput }) =>
      updateCategory(slug, categoryId, input),
    onMutate: async ({ categoryId, input }) => {
      const key = queryKeys.finance.categories(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Category[]>(key);
      if (previous) {
        queryClient.setQueryData<Category[]>(
          key,
          previous.map((c) => (c.id === categoryId ? { ...c, ...input } : c))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.finance.categories(slug), ctx.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.categories(slug) });
    },
  });
}

export function useDeleteCategory() {
  const slug = useWorkspaceSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(slug, categoryId),
    onMutate: async (categoryId) => {
      const key = queryKeys.finance.categories(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Category[]>(key);
      if (previous) {
        queryClient.setQueryData<Category[]>(key, previous.filter((c) => c.id !== categoryId));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.finance.categories(slug), ctx.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.categories(slug) });
    },
  });
}

