"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ChartSkeleton } from "@/features/dashboard";
import { DashboardHeader } from "@/features/dashboard";
import { SummaryCards } from "@/features/dashboard";
import { TrendsPanel } from "@/features/dashboard";
import { AccountsPanel } from "@/features/dashboard";
import { TransactionsPreview } from "@/features/dashboard";
import { FinnAIScoreWidget } from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";

const CashflowChart = dynamic(
  () =>
    import("@/features/dashboard").then((m) => ({
      default: m.CashflowChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CategoryDonutChart = dynamic(
  () =>
    import("@/features/dashboard").then((m) => ({
      default: m.CategoryDonutChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const DashboardPage = () => {
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
