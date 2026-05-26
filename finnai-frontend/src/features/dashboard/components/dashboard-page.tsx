"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ChartSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { TrendsPanel } from "@/features/dashboard/components/trends-panel";
import { AccountsPanel } from "@/features/dashboard/components/accounts-panel";
import { TransactionsPreview } from "@/features/dashboard/components/transactions-preview";
import { FinnAIScoreWidget } from "@/features/dashboard/components/finnai-score-widget";
import type { DateRangePreset } from "@/features/dashboard/types";

const CashflowChart = dynamic(
  () =>
    import("@/features/dashboard/components/cashflow-chart").then((m) => ({
      default: m.CashflowChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CategoryDonutChart = dynamic(
  () =>
    import("@/features/dashboard/components/category-donut-chart").then((m) => ({
      default: m.CategoryDonutChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export function DashboardPage() {
  const [range, setRange] = useState<DateRangePreset>("30d");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardHeader range={range} onRangeChange={setRange} />
      <SummaryCards />

      <div className="grid gap-4 lg:grid-cols-3">
        <CashflowChart range={range} />
        <CategoryDonutChart range={range} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TrendsPanel />
        <AccountsPanel />
        <FinnAIScoreWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TransactionsPreview />
      </div>
    </div>
  );
}
