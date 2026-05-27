"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReducedMotion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { ChartEmpty } from "@/features/dashboard";
import { ChartError } from "@/features/dashboard";
import { useCategoryAnalytics } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { CHART_COLORS, chartTooltipStyle } from "../../utils/chart-theme";
import { formatCentsBRL, formatPercent } from "@/lib/formatters/money";
import { queryKeys } from "@/shared/api/query-keys";

type CategoryDonutChartProps = {
  range: DateRangePreset;
};

export const CategoryDonutChart = memo(function CategoryDonutChart({ range }: CategoryDonutChartProps) {
  const { data, isLoading, isError } = useCategoryAnalytics(range);
  const reduceMotion = useReducedMotion();

  const { chartData, total } = useMemo(() => {
    const items = data?.items ?? [];
    const sum = items.reduce((acc, item) => acc + item.total_cents, 0);
    return {
      total: sum,
      chartData: items.map((item) => ({
        name: item.name,
        value: item.total_cents,
        percent: item.percent,
      })),
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-[280px] w-full rounded-xl" />}
        {isError && (
          <ChartError
            buildQueryKey={(slug) => queryKeys.dashboard.categories(slug, range)}
            title="Erro nas categorias"
          />
        )}
        {!isLoading && !isError && chartData.length === 0 && <ChartEmpty />}
        {!isLoading && !isError && chartData.length > 0 && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div
              className="relative mx-auto h-[200px] w-[200px] shrink-0 sm:h-[220px] sm:w-[220px]"
              role="img"
              aria-label="Gráfico de despesas por categoria"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="85%"
                    paddingAngle={2}
                    isAnimationActive={!reduceMotion}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) =>
                      formatCentsBRL(typeof value === "number" ? value : Number(value ?? 0))
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-muted">Total</span>
                <span className="text-lg font-bold text-foreground">{formatCentsBRL(total)}</span>
              </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-2">
              {chartData.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS.palette[index % CHART_COLORS.palette.length],
                      }}
                    />
                    <span className="truncate text-foreground">{item.name}</span>
                  </div>
                  <span className="shrink-0 text-muted">
                    {formatPercent(item.percent, 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
