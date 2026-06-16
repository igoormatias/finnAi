import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrencyBRL } from "@/lib/formatters/money";

import type { Goal } from "../../types";
import { buildPortfolioInsight } from "../../utils/goal-insights";
import { getMonthlyProjectionCents } from "../../utils/goal-progress";

export const GoalAnalyticsPanel = ({ goals }: { goals: Goal[] }) => {
  const active = goals.filter((g) => g.status === "active");
  const projections = active
    .map((g) => getMonthlyProjectionCents(g))
    .filter((v): v is number => v != null && v > 0);
  const avgMonthly =
    projections.length > 0
      ? Math.round(projections.reduce((a, b) => a + b, 0) / projections.length)
      : null;

  const nearest = active
    .filter((g) => g.target_date)
    .sort((a, b) => (a.target_date! > b.target_date! ? 1 : -1))[0];

  const monthsLeft = nearest?.target_date
    ? Math.max(
        0,
        (new Date(nearest.target_date).getFullYear() - new Date().getFullYear()) * 12 +
          (new Date(nearest.target_date).getMonth() - new Date().getMonth())
      )
    : null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-surface/80 to-elevated/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Insights financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Projeção mensal média
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {avgMonthly != null ? formatCurrencyBRL(avgMonthly) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Prazo mais próximo
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {monthsLeft != null ? `${monthsLeft} mês(es)` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Insight</p>
          <p className="mt-1 text-sm text-muted">{buildPortfolioInsight(goals)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
