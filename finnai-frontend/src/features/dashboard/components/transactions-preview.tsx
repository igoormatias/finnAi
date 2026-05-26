"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecentTransactions } from "@/features/dashboard/hooks/use-recent-transactions";
import { useWorkspaceSlug } from "@/features/workspaces/hooks/use-workspace-slug";
import { formatRelativeDate } from "@/lib/formatters/date";
import { formatCentsBRL } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";
import { workspacePath } from "@/shared/config/routes";

export function TransactionsPreview() {
  const slug = useWorkspaceSlug();
  const { data, isLoading, isError } = useRecentTransactions();

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Últimas transações</CardTitle>
        <Link
          href={workspacePath(slug, "gastos")}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver tudo
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {isError && <ErrorState title="Erro ao carregar transações" />}
        {!isLoading && !isError && data?.items.length === 0 && (
          <EmptyState title="Sem transações recentes" />
        )}
        {!isLoading && !isError && data && data.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="max-w-[180px] truncate font-medium">
                    {tx.description}
                  </TableCell>
                  <TableCell className="hidden text-muted sm:table-cell">
                    {formatRelativeDate(tx.transaction_date)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      tx.type === "income" ? "text-success" : "text-danger"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCentsBRL(tx.amount_cents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
