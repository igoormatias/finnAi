"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Info, Shield, Sparkles, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/states";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useDashboardOverview } from "@/features/dashboard";
import { useRecentTransactions } from "@/features/dashboard";
import { InviteMemberDialog } from "@/features/workspaces";
import { Can } from "@/features/workspaces";
import { MemberAvatar } from "@/features/workspaces";
import { PrivacyToggle } from "@/features/workspaces";
import { RoleBadge } from "@/features/workspaces";
import { useWorkspaceMembers } from "@/features/workspaces";
import { useWorkspaceSlug } from "@/features/workspaces";
import { useWorkspaceUiStore } from "@/features/workspaces/store/workspace-ui-store";
import { roleSubtitle } from "../../utils/role-labels";
import { formatCentsBRL } from "@/lib/formatters/money";
import { workspacePath } from "@/shared/config/routes";
import { cn } from "@/lib/utils";

export const WorkspaceHubPage = () => {
  const slug = useWorkspaceSlug();
  const reduceMotion = useReducedMotion();
  const [inviteOpen, setInviteOpen] = useState(false);
  const overview = useDashboardOverview();
  const recent = useRecentTransactions();
  const membersQuery = useWorkspaceMembers();
  const privacy = useWorkspaceUiStore((s) => s.getPrivacy(slug));
  const setPrivacy = useWorkspaceUiStore((s) => s.setPrivacy);

  const members = membersQuery.data ?? [];
  const previewMembers = useMemo(() => members.slice(0, 5), [members]);

  const balance = overview.data?.total_balance_cents ?? 0;
  const savingsRate = overview.data?.savings_rate ?? 0;

  if (membersQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o workspace familiar."
        action={
          <Button type="button" variant="outline" onClick={() => void membersQuery.refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">Workspace Familiar</h1>
          <p className="text-sm text-muted">
            {membersQuery.isLoading ? "Carregando membros…" : `${members.length} membros ativos`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="invite">
            <Button type="button" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Convidar membro
            </Button>
          </Can>
          <Button variant="outline" asChild>
            <Link href={workspacePath(slug, "settings")}>Gerenciar limites</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full border-primary/20 bg-linear-to-br from-surface to-elevated/40">
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted">
                Saldo familiar compartilhado
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {overview.isLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <>
                  <p className="text-3xl font-bold tracking-tight">{formatCentsBRL(balance)}</p>
                  <p className="flex items-center gap-1 text-sm text-success">
                    <ArrowUpRight className="h-4 w-4" />
                    {(savingsRate * 100).toFixed(1)}% taxa de poupança no período
                  </p>
                </>
              )}
              <div className="flex items-center gap-1">
                {previewMembers.slice(0, 3).map((m) => (
                  <MemberAvatar
                    key={m.id}
                    name={m.user_name}
                    email={m.user_email}
                    className="-ml-2 first:ml-0 h-9 w-9 border-2 border-surface text-xs"
                  />
                ))}
                {members.length > 3 && (
                  <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-elevated/60 text-xs font-semibold">
                    +{members.length - 3}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.05 }}
        >
          <Card className="h-full border-primary/15 bg-elevated/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle>Insight da IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted">
                <span className="text-foreground">
                  Colaboração em alta neste workspace.
                </span>{" "}
                Revise gastos compartilhados e convide familiares para manter as metas em dia.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle>Membros da família</CardTitle>
              <Badge variant="primary">{members.length} ativos</Badge>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={workspacePath(slug, "members")} className="cursor-pointer">
                Ver todos
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            {membersQuery.isLoading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            {!membersQuery.isLoading &&
              previewMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex cursor-default items-center justify-between gap-3 rounded-xl border border-border/60 bg-elevated/20 px-3 py-3 transition-colors hover:border-primary/20 hover:bg-elevated/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar name={member.user_name} email={member.user_email} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.user_name || member.user_email}</p>
                      <p className="truncate text-xs text-muted">{roleSubtitle(member.role)}</p>
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              ))}
            <p className="flex items-start gap-2 pt-2 text-xs text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Membros com &quot;Apenas ver&quot; não podem editar transações ou convidar outros membros.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividade recente</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={workspacePath(slug, "transactions")}>Ver tudo</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.isLoading && <Skeleton className="h-32 w-full" />}
            {!recent.isLoading && (recent.data?.items.length ?? 0) === 0 && (
              <p className="text-sm text-muted">Nenhuma transação recente.</p>
            )}
            <ul className="grid gap-4">
              {recent.data?.items.slice(0, 4).map((tx) => (
                <li key={tx.id} className="relative border-l-2 border-primary/30 pl-4">
                  <span
                    className={cn(
                      "absolute -left-[5px] top-1 h-2 w-2 rounded-full",
                      tx.type === "income" ? "bg-success" : "bg-danger"
                    )}
                  />
                  <p className="text-sm font-medium">{tx.description || "Transação"}</p>
                  <p className={cn("text-sm font-semibold", tx.type === "income" ? "text-success" : "text-danger")}>
                    {formatCentsBRL(tx.amount_cents)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle>Privacidade</CardTitle>
        </CardHeader>
        <CardContent className="grid max-w-xl gap-4">
          <PrivacyToggle
            label="Ocultar saldo de visualizadores"
            checked={privacy.hideBalanceFromViewers}
            onCheckedChange={(checked) => setPrivacy(slug, { hideBalanceFromViewers: checked })}
          />
          <PrivacyToggle
            label="Permitir exportação de dados"
            checked={privacy.allowDataExport}
            onCheckedChange={(checked) => setPrivacy(slug, { allowDataExport: checked })}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href={workspacePath(slug, "members")}>Membros</Link>
        </Button>
        <Can permission="invite">
          <Button variant="outline" asChild>
            <Link href={workspacePath(slug, "invites")}>Convites</Link>
          </Button>
        </Can>
        <Button variant="outline" asChild>
          <Link href={workspacePath(slug, "settings")}>Configurações</Link>
        </Button>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </section>
  );
}
