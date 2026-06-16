"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { ErrorState } from "@/components/states";
import { useTrendAnalytics } from "@/features/dashboard";
import { formatCurrencyBRL, formatGrowthRate } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

function TrendRow({
  label,
  current,
  previous,
  growth,
  positiveIsGood,
}: {
  label: string;
  current: number;
  previous: number;
  growth: number;
  positiveIsGood: boolean;
}) {
  const up = growth >= 0;
  const good = positiveIsGood ? up : !up;

  return (
    <div className="rounded-xl border border-border bg-elevated/20 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrencyBRL(current)}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted">Anterior: {formatCurrencyBRL(previous)}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            good ? "text-success" : "text-danger"
          )}
        >
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {formatGrowthRate(growth)}
        </span>
      </div>
    </div>
  );
}

export const TrendsPanel = ({ period }: { period?: string }) => {
  const { data, isLoading, isError } = useTrendAnalytics(period);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências do mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        )}
        {isError && <ErrorState title="Não foi possível carregar tendências" />}
        {data && (
          <>
            <TrendRow
              label="Receitas"
              current={data.current_income_cents}
              previous={data.previous_income_cents}
              growth={data.income_growth_rate}
              positiveIsGood
            />
            <TrendRow
              label="Despesas"
              current={data.current_expense_cents}
              previous={data.previous_expense_cents}
              growth={data.expense_growth_rate}
              positiveIsGood={false}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
