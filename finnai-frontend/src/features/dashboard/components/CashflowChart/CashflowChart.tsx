"use client";

import { memo, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { ChartEmpty } from "@/features/dashboard";
import { ChartError } from "@/features/dashboard";
import { useCashflow } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { CHART_COLORS, chartTooltipStyle } from "../../utils/chart-theme";
import { formatBucketLabel } from "@/lib/formatters/date";
import { formatCurrencyBRL } from "@/lib/formatters/money";
import { queryKeys } from "@/shared/api/query-keys";

type CashflowChartProps = {
  range: DateRangePreset;
};

function CashflowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={chartTooltipStyle} className="px-3 py-2 text-xs">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrencyBRL(entry.value)}
        </p>
      ))}
    </div>
  );
}

export const CashflowChart = memo(function CashflowChart({ range }: CashflowChartProps) {
  const { data, isLoading, isError } = useCashflow(range);
  const reduceMotion = useReducedMotion();

  const chartData = useMemo(() => {
    if (!data?.points.length) return [];
    return data.points.map((point) => ({
      label: formatBucketLabel(point.bucket_start, data.granularity),
      income: point.income_cents,
      expense: point.expense_cents,
      balance: point.cumulative_balance_cents,
    }));
  }, [data]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo de caixa</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-[280px] w-full rounded-xl" />}
        {isError && (
          <ChartError
            buildQueryKey={(slug) => queryKeys.dashboard.cashflow(slug, range)}
            title="Erro no fluxo de caixa"
          />
        )}
        {!isLoading && !isError && chartData.length === 0 && <ChartEmpty />}
        {!isLoading && !isError && chartData.length > 0 && (
          <div
            className="h-[280px] w-full min-h-[220px]"
            role="img"
            aria-label="Gráfico de fluxo de caixa com receitas, despesas e saldo acumulado"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
                <YAxis
                  tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
                  tickFormatter={(v) => formatCurrencyBRL(Number(v)).replace("R$", "")}
                  width={56}
                />
                <Tooltip content={<CashflowTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Receitas"
                  stroke={CHART_COLORS.primary}
                  fill="url(#incomeGradient)"
                  isAnimationActive={!reduceMotion}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Despesas"
                  stroke={CHART_COLORS.danger}
                  fill="url(#expenseGradient)"
                  isAnimationActive={!reduceMotion}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Saldo"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reduceMotion}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
