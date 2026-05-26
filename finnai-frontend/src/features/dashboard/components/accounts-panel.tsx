"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { useAccountsAnalytics } from "@/features/dashboard/hooks/use-accounts-analytics";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { formatCentsBRL } from "@/lib/formatters/money";
import { workspacePath } from "@/shared/config/routes";

export function AccountsPanel() {
  const slug = useWorkspaceSlug();
  const { data, isLoading, isError } = useAccountsAnalytics();

  const total =
    data?.items.reduce((acc, item) => acc + item.current_balance_cents, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contas</CardTitle>
        <Link
          href={workspacePath(slug, "gastos")}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver contas
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        {isError && <ErrorState title="Erro ao carregar contas" />}
        {!isLoading && !isError && data?.items.length === 0 && (
          <EmptyState title="Nenhuma conta cadastrada" />
        )}
        {data?.items.map((account) => {
          const pct = total > 0 ? (account.current_balance_cents / total) * 100 : 0;
          return (
            <div key={account.account_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{account.name}</span>
                <span className="text-muted">{formatCentsBRL(account.current_balance_cents)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-elevated/50">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
