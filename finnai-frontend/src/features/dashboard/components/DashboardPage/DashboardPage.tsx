"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import {
  AccountsPanel,
  ChartSkeleton,
  DashboardHeader,
  EmergencyReserveCard,
  FinnAIScoreWidget,
  SummaryCards,
  TransactionsPreview,
  TrendsPanel,
} from "@/features/dashboard";
import type { DateRangePreset } from "@/features/dashboard/types";
import { isFuturePreset } from "@/features/dashboard";

const CashflowChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.CashflowChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const CategoryDonutChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.CategoryDonutChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const MonthlyExpensesChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.MonthlyExpensesChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const MonthlyComparisonChart = dynamic(
  () => import("@/features/dashboard").then((m) => ({ default: m.MonthlyComparisonChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const DashboardPage = () => {
  const [range, setRange] = useState<DateRangePreset>("30d");
  const cashflowMode = isFuturePreset(range) ? "projected" : "complete";

  return (
    <PageContainer size="wide">
      <DashboardHeader range={range} onRangeChange={setRange} />
      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EmergencyReserveCard />
        <MonthlyComparisonChart />
      </div>

      <StaggerChildren className="grid gap-4 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2">
          <CashflowChart range={range} mode={cashflowMode} />
        </StaggerItem>
        <StaggerItem>
          <CategoryDonutChart range={range} />
        </StaggerItem>
      </StaggerChildren>

      <MonthlyExpensesChart />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TrendsPanel period={range} />
        <AccountsPanel />
        <FinnAIScoreWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TransactionsPreview />
      </div>
    </PageContainer>
  );
};
