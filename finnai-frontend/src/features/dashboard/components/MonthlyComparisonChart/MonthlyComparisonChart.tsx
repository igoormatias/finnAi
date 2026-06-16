"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { ChartEmpty } from "@/features/dashboard";
import { useMonthlyExpenses } from "@/features/dashboard";
import { CHART_COLORS, chartTooltipStyle } from "@/features/dashboard";
import { formatCurrencyBRL } from "@/lib/formatters/money";

export const MonthlyComparisonChart = () => {
  const { data, isLoading, isError } = useMonthlyExpenses();

  const chartData = useMemo(() => {
    const items = data?.items ?? [];
    if (items.length < 2) return [];
    const current = items[items.length - 1];
    const previous = items[items.length - 2];
    return [
      { label: "Mês anterior", expense: previous.expense_cents },
      { label: "Mês atual", expense: current.expense_cents },
    ];
  }, [data]);

  const delta = data?.items?.[data.items.length - 1]?.vs_previous_percent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Comparação mensal</span>
          {delta !== null && delta !== undefined && (
            <span className="text-xs font-normal text-muted">{delta > 0 ? "+" : ""}{delta}% vs anterior</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-[200px] w-full rounded-xl" />}
        {!isLoading && !isError && chartData.length === 0 && <ChartEmpty />}
        {!isLoading && !isError && chartData.length > 0 && (
          <div className="h-[200px] w-full" role="img" aria-label="Comparação de gastos mês atual vs anterior">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} width={48} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => formatCurrencyBRL(Number(value))}
                />
                <Bar dataKey="expense" name="Despesas" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
