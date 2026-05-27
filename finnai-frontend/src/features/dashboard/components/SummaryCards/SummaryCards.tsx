"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { useDashboardOverview } from "@/features/dashboard";
import { useTrendAnalytics } from "@/features/dashboard";
import { SummaryCard } from "@/features/dashboard";

export const SummaryCards = () => {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: trends } = useTrendAnalytics();
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
    },
  };

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <SummaryCard
        title="Saldo total"
        valueCents={overview?.total_balance_cents ?? 0}
        icon={Wallet}
        loading={overviewLoading}
        variant="primary"
      />
      <SummaryCard
        title="Receitas"
        valueCents={overview?.monthly_income_cents ?? 0}
        icon={TrendingUp}
        trend={trends?.income_growth_rate}
        trendLabel="vs mês anterior"
        loading={overviewLoading}
        variant="success"
      />
      <SummaryCard
        title="Despesas"
        valueCents={overview?.monthly_expense_cents ?? 0}
        icon={TrendingDown}
        trend={trends?.expense_growth_rate}
        trendLabel="vs mês anterior"
        loading={overviewLoading}
        variant="danger"
      />
      <SummaryCard
        title="Economia"
        valueCents={overview?.savings_cents ?? 0}
        icon={PiggyBank}
        loading={overviewLoading}
      />
    </motion.div>
  );
}
