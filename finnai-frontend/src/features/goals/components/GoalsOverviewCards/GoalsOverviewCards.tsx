import { CheckCircle2, PiggyBank, Target, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCentsBRL } from "@/lib/formatters/money";

import type { GoalsOverview } from "../../types";

const cards = [
  { key: "active", label: "Metas ativas", icon: Target, field: "active_count" as const, format: (v: number) => String(v) },
  { key: "completed", label: "Concluídas", icon: CheckCircle2, field: "completed_count" as const, format: (v: number) => String(v) },
  { key: "saved", label: "Valor economizado", icon: PiggyBank, field: "total_saved_cents" as const, format: formatCentsBRL },
  { key: "progress", label: "Progresso total", icon: TrendingUp, field: "total_progress_percent" as const, format: (v: number) => `${v}%` },
];

export const GoalsOverviewCards = ({ overview }: { overview: GoalsOverview }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {cards.map(({ key, label, icon: Icon, field, format }) => (
      <Card key={key} interactive className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </CardTitle>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {format(overview[field])}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
