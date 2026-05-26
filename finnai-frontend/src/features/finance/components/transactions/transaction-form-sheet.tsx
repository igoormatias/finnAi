"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Repeat, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type {
  Account,
  Category,
  RecurrenceRule,
  Transaction,
  TransactionCreateInput,
  TransactionType,
  TransactionUpdateInput,
} from "@/features/finance/types/finance-types";
import { parseBRLToCents } from "@/features/finance/utils/currency";
import { cn } from "@/lib/utils";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Informe uma descrição").max(255),
  amount: z.string().min(1, "Informe um valor"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  account_id: z.string().min(1, "Selecione uma conta"),
  transaction_date: z.string().min(1, "Selecione uma data"),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.enum(["weekly", "monthly", "yearly"]).optional(),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.input<typeof schema>;

function buildDefault({
  editing,
  presetType,
}: {
  editing: Transaction | null;
  presetType: TransactionType | null;
}): FormValues {
  if (editing) {
    return {
      type: editing.type,
      description: editing.description || "",
      amount: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        editing.amount_cents / 100
      ),
      category_id: editing.category_id,
      account_id: editing.account_id,
      transaction_date: editing.transaction_date.slice(0, 10),
      is_recurring: editing.is_recurring,
      recurrence_rule: (editing.recurrence_rule ?? undefined) as RecurrenceRule | undefined,
      notes: editing.notes ?? "",
    };
  }
  return {
    type: presetType ?? "expense",
    description: "",
    amount: "",
    category_id: "",
    account_id: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    is_recurring: false,
    recurrence_rule: "monthly",
    notes: "",
  };
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  editing,
  presetType,
  categories,
  accounts,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Transaction | null;
  presetType: TransactionType | null;
  categories: Category[];
  accounts: Account[];
  onCreate: (input: TransactionCreateInput) => Promise<void>;
  onUpdate: (id: string, input: TransactionUpdateInput) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const defaults = useMemo(() => buildDefault({ editing, presetType }), [editing, presetType]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  const isRecurring = form.watch("is_recurring");
  const type = form.watch("type");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-foreground">
            {editing ? "Editar transação" : "Nova transação"}
          </div>
          <div className="text-sm text-muted">
            {editing ? "Ajuste os campos e salve." : "Preencha os dados para registrar no seu fluxo."}
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            setSubmitting(true);
            try {
              const amount_cents = parseBRLToCents(values.amount);

              const base = {
                type: values.type,
                description: values.description,
                amount_cents,
                category_id: values.category_id,
                account_id: values.account_id,
                transaction_date: new Date(values.transaction_date).toISOString(),
                is_recurring: values.is_recurring,
                recurrence_rule: values.is_recurring ? (values.recurrence_rule ?? "monthly") : null,
                notes: values.notes?.trim() ? values.notes.trim() : null,
              } satisfies TransactionCreateInput;

              if (editing) {
                await onUpdate(editing.id, base);
              } else {
                await onCreate(base);
              }
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <Card className="space-y-3 border-border bg-elevated/10 p-3">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Tipo</label>
              <div className="inline-flex rounded-xl border border-border bg-elevated/40 p-1">
                {[
                  { id: "expense" as const, label: "Despesa" },
                  { id: "income" as const, label: "Receita" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      form.getValues("type") === opt.id
                        ? opt.id === "expense"
                          ? "bg-danger text-bg"
                          : "bg-success text-bg"
                        : "text-muted hover:text-foreground"
                    )}
                    onClick={() => form.setValue("type", opt.id, { shouldDirty: true, shouldValidate: true })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Descrição</label>
              <Input {...form.register("description")} placeholder="Ex: Starbucks Coffee" />
              {form.formState.errors.description && (
                <p className="text-xs text-danger">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Valor</label>
              <Input
                {...form.register("amount")}
                inputMode="decimal"
                placeholder="R$ 0,00"
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-danger">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Categoria</label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                {...form.register("category_id")}
              >
                <option value="">Selecione…</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.category_id && (
                <p className="text-xs text-danger">{form.formState.errors.category_id.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Conta</label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                {...form.register("account_id")}
              >
                <option value="">Selecione…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.account_id && (
                <p className="text-xs text-danger">{form.formState.errors.account_id.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Data</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input {...form.register("transaction_date")} type="date" className="pl-9" />
              </div>
              {form.formState.errors.transaction_date && (
                <p className="text-xs text-danger">{form.formState.errors.transaction_date.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-elevated/20 px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Repeat className="h-4 w-4 text-primary" />
                  Recorrência
                </div>
                <div className="text-xs text-muted">Marque se esta transação se repete.</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-primary"
                checked={!!isRecurring}
                onChange={(e) => form.setValue("is_recurring", e.currentTarget.checked, { shouldDirty: true })}
                aria-label="Transação recorrente"
              />
            </div>

            {isRecurring && (
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted">Frequência</label>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  {...form.register("recurrence_rule")}
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            )}
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !form.formState.isValid}>
              <Save className="h-4 w-4" />
              {editing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

