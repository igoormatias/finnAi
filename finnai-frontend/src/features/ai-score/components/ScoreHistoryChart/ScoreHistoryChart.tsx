"use client";

import { memo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ScoreHistoryPoint } from "../../types";
import { ChartEmpty } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CHART_COLORS, chartTooltipStyle } from "@/features/dashboard";

type ScoreHistoryChartProps = {
  history: ScoreHistoryPoint[];
};

function formatLabel(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const ScoreHistoryChart = memo(({ history }: ScoreHistoryChartProps) => {
  const data = history.map((p) => ({
    label: formatLabel(p.generated_at),
    score: p.score,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução do score</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length < 2 ? (
          <ChartEmpty title="Regenere o score algumas vezes para ver a evolução." />
        ) : (
          <>
            <div className="h-[220px] w-full" aria-label="Gráfico de evolução do FinnAI Score">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_COLORS.primary }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>Evolução do FinnAI Score</caption>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
});

ScoreHistoryChart.displayName = "ScoreHistoryChart";
