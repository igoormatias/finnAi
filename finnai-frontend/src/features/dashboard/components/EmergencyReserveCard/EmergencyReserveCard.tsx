"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { useEmergencyReserve } from "@/features/dashboard";
import { useWorkspaceSlug } from "@/features/workspaces";
import { formatCurrencyBRL } from "@/lib/formatters/money";
import { workspacePath } from "@/shared/config/routes";

export const EmergencyReserveCard = () => {
  const slug = useWorkspaceSlug();
  const { data, isLoading, isError } = useEmergencyReserve();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return null;
  }

  const progress =
    data.target_cents > 0
      ? Math.min(100, Math.round((data.reserved_cents / data.target_cents) * 100))
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Reserva de emergência</CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-elevated/50 text-primary">
          <Shield className="h-4 w-4" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-foreground">{formatCurrencyBRL(data.reserved_cents)}</p>
          <p className="text-xs text-muted">
            Meta: {formatCurrencyBRL(data.target_cents)} ({data.target_months} meses)
          </p>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-elevated"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Despesa média: {formatCurrencyBRL(data.avg_monthly_expense_cents)}/mês</span>
          {data.coverage_months != null ? (
            <Badge variant="default">
              {data.coverage_months.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses de
              cobertura
            </Badge>
          ) : (
            <Badge variant="default">Cobertura indisponível</Badge>
          )}
        </div>

        {data.coverage_months == null && (
          <p className="text-xs text-muted">
            Cadastre despesas ou defina uma meta de reserva para calcular a cobertura.
          </p>
        )}

        {!data.has_emergency_goal && (
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href={workspacePath(slug, "goals")}>Criar meta de reserva</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
