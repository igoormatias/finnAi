"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { ChartEmpty } from "@/features/dashboard";
import { useMonthlyExpenses } from "@/features/dashboard";
import { CHART_COLORS, chartTooltipStyle } from "@/features/dashboard";
import { formatCurrencyBRL } from "@/lib/formatters/money";

export const MonthlyExpensesChart = () => {
  const { data, isLoading, isError } = useMonthlyExpenses();

  const chartData = useMemo(() => {
    return (data?.items ?? []).map((item) => ({
      label: item.month.slice(5),
      expense: item.expense_cents,
      income: item.income_cents,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-[240px] w-full rounded-xl" />}
        {!isLoading && !isError && chartData.length === 0 && <ChartEmpty />}
        {!isLoading && !isError && chartData.length > 0 && (
          <div className="h-[240px] w-full" role="img" aria-label="Gráfico de evolução de gastos mensais">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} width={48} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => formatCurrencyBRL(Number(value))}
                />
                <Bar dataKey="expense" name="Despesas" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
