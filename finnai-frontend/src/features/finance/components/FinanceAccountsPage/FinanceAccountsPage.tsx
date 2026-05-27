"use client";

import { CreditCard, Landmark, Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { ErrorState } from "@/components/states";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/features/finance";
import type { Account, AccountType } from "@/features/finance/types/finance-types";
import { formatCentsBRL } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: { id: AccountType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "checking", label: "Conta corrente", icon: Landmark },
  { id: "savings", label: "Poupança", icon: Landmark },
  { id: "wallet", label: "Carteira", icon: Wallet },
  { id: "credit_card", label: "Cartão de crédito", icon: CreditCard },
  { id: "investment", label: "Investimentos", icon: Landmark },
];

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = ACCOUNT_TYPES.find((t) => t.id === account.type);
  const Icon = meta?.icon ?? Wallet;

  return (
    <Card className="border-border/80 bg-surface/60 transition-all hover:border-primary/30 hover:shadow-glow-primary/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate">{account.name}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="default">{meta?.label ?? account.type}</Badge>
            <div className="inline-flex items-center gap-2 text-xs text-muted">
              <Icon className="h-4 w-4 text-primary" />
              Saldo inicial: {formatCentsBRL(account.initial_balance_cents)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Excluir conta">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div className="text-xs text-muted">Saldo atual</div>
          <div className={cn("text-2xl font-bold tabular-nums", "text-foreground")}>
            {formatCentsBRL(account.current_balance_cents)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Account | null;
  onSubmit: (values: { name: string; type: AccountType; initial_balance_cents?: number }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "checking");
  const [initialBalance, setInitialBalance] = useState(
    initial ? String(initial.initial_balance_cents / 100) : "0"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-foreground">
            {initial ? "Editar conta" : "Nova conta"}
          </div>
          <div className="text-sm text-muted">Cadastre contas para distribuir suas transações.</div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted">Nome</label>
            <Input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Ex: Nubank" />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted">Tipo</label>
            <select
              className="h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              value={type}
              onChange={(e) => setType(e.currentTarget.value as AccountType)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {!initial && (
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Saldo inicial (R$)</label>
              <Input
                inputMode="decimal"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.currentTarget.value)}
                placeholder="0,00"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const cents = Math.round(Number(initialBalance.replace(",", ".")) * 100);
              onSubmit({ name, type, initial_balance_cents: Number.isFinite(cents) ? cents : 0 });
              onOpenChange(false);
            }}
            disabled={name.trim().length === 0}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const FinanceAccountsPage = () => {
  const { data, isLoading, isError } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const accounts = data ?? [];
  const totalBalance = useMemo(
    () => accounts.reduce((acc, a) => acc + a.current_balance_cents, 0),
    [accounts]
  );

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState title="Não foi possível carregar contas" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Contas</h1>
          <p className="text-sm text-muted">
            Visão geral de saldos e tipos de conta para sua gestão diária.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <Card className="bg-linear-to-br from-primary/10 to-elevated/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saldo total</CardTitle>
          <Badge variant="primary">Preview</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums text-foreground">
            {formatCentsBRL(totalBalance)}
          </div>
          <div className="mt-2 text-xs text-muted">Soma dos saldos atuais de todas as contas.</div>
        </CardContent>
      </Card>

      {!isLoading && accounts.length === 0 && (
        <EmptyState
          title="Sem contas"
          description="Crie uma conta para começar a lançar transações."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Criar conta
            </Button>
          }
        />
      )}

      {accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => {
                setEditing(account);
                setOpen(true);
              }}
              onDelete={() => void deleteMutation.mutateAsync(account.id)}
            />
          ))}
        </div>
      )}

      <AccountModal
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={(values) => {
          if (editing) {
            void updateMutation.mutateAsync({ accountId: editing.id, input: { name: values.name, type: values.type } });
          } else {
            void createMutation.mutateAsync(values);
          }
        }}
      />
    </div>
  );
}

