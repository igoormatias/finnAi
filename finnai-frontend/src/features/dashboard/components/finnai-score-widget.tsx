"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinnAIScore } from "@/features/dashboard/hooks/use-finnai-score";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { workspacePath } from "@/shared/config/routes";

export function FinnAIScoreWidget() {
  const slug = useWorkspaceSlug();
  const { data, isLoading, isError } = useFinnAIScore();

  const score = data?.score ?? null;

  return (
    <Card className="border-primary/20 bg-linear-to-br from-surface to-elevated/30">
      <CardHeader>
        <CardTitle>FinnAI Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {isLoading && (
          <>
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
          </>
        )}
        {!isLoading && (
          <>
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/40 bg-elevated/40"
              aria-label={score !== null ? `Score financeiro ${score}` : "Score indisponível"}
            >
              <span className="text-3xl font-bold text-primary">
                {isError || score === null ? "—" : score}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data?.label ?? "Análise em breve"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {data?.summary ?? "Conecte suas contas para gerar o score."}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={workspacePath(slug, "score")}>Ver análise completa</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
