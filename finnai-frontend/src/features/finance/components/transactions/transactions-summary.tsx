"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/features/finance/types/finance-types";
import { formatCentsBRL } from "@/lib/formatters/money";

function sum(items: Transaction[], type: "income" | "expense") {
  return items.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount_cents, 0);
}

export function TransactionsSummary({
  items,
  isLoading,
}: {
  items: Transaction[] | undefined;
  isLoading: boolean;
}) {
  const incomes = items ? sum(items, "income") : 0;
  const expenses = items ? sum(items, "expense") : 0;
  const net = incomes - expenses;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-primary/10 bg-surface/60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            Entradas
          </CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="text-2xl font-bold text-success">{formatCentsBRL(incomes)}</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-danger/10 bg-surface/60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            Saídas
          </CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-danger/10 text-danger">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="text-2xl font-bold text-danger">{formatCentsBRL(expenses)}</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface/60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            Saldo
          </CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-elevated/50 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="text-2xl font-bold text-foreground">{formatCentsBRL(net)}</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-primary/10 to-elevated/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            Ação rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground">
            Adicione receitas e despesas para manter seu controle diário.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

