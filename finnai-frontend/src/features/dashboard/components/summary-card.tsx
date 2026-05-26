"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCentsBRL, formatGrowthRate } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

export type SummaryCardProps = {
  title: string;
  valueCents: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  variant?: "default" | "success" | "danger" | "primary";
};

const variantStyles = {
  default: "text-foreground",
  success: "text-success",
  danger: "text-danger",
  primary: "text-primary",
};

export function SummaryCard({
  title,
  valueCents,
  icon: Icon,
  trend,
  trendLabel,
  loading,
  variant = "default",
}: SummaryCardProps) {
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <Card className="transition-shadow hover:shadow-glow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  const trendUp = trend !== undefined && trend >= 0;
  const formatted = formatCentsBRL(valueCents);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
    >
      <Card className="border-border/80 transition-all hover:border-primary/30 hover:shadow-glow-primary/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted">
            {title}
          </CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated/50 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <motion.p
            className={cn("text-2xl font-bold tracking-tight", variantStyles[variant])}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatted}
          </motion.p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted">
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              )}
              <span className={trendUp ? "text-success" : "text-danger"}>
                {formatGrowthRate(trend)}
              </span>
              {trendLabel && <span>{trendLabel}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
