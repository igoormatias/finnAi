"use client";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states/error-state";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { queryKeys } from "@/shared/api/query-keys";

export function ChartError({
  buildQueryKey,
  title = "Não foi possível carregar o gráfico",
}: {
  buildQueryKey: (slug: string) => readonly unknown[];
  title?: string;
}) {
  const queryClient = useQueryClient();
  const slug = useWorkspaceSlug();
  const queryKey = buildQueryKey(slug);

  return (
    <ErrorState
      title={title}
      className="min-h-[220px]"
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey });
            void queryClient.invalidateQueries({
              queryKey: queryKeys.dashboard.overview(slug),
            });
          }}
        >
          Tentar novamente
        </Button>
      }
    />
  );
}
