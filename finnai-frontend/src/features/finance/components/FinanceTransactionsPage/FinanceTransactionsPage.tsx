"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { ErrorState } from "@/components/states";
import { TransactionsSummary } from "@/features/finance";
import { TransactionsFilters } from "@/features/finance";
import { TransactionsPagination } from "@/features/finance";
import { TransactionsTable } from "@/features/finance";
import { TransactionFormSheet } from "@/features/finance";
import { useAccounts } from "@/features/finance";
import { useCategories } from "@/features/finance";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/features/finance";
import type { Transaction, TransactionType, TransactionsFilters as Filters } from "@/features/finance/types/finance-types";
import { cn } from "@/lib/utils";

const DEFAULT_LIMIT = 20;

function defaultFilters(): Filters {
  return {
    limit: DEFAULT_LIMIT,
    offset: 0,
    sort: "newest",
  };
}

export const FinanceTransactionsPage = () => {
  const reduceMotion = useReducedMotion();
  const [filters, setFilters] = useState<Filters>(() => defaultFilters());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [presetType, setPresetType] = useState<TransactionType | null>(null);

  const categoriesQuery = useCategories();
  const accountsQuery = useAccounts();

  const { data, isLoading, isFetching, isError } = useTransactions(filters);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const categories = categoriesQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const items = data?.items ?? [];

  const readyForCreate = useMemo(() => categories.length > 0 && accounts.length > 0, [accounts.length, categories.length]);
  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditing(null);
      setPresetType(null);
    }
  };

  const openCreate = (type?: TransactionType) => {
    setEditing(null);
    setPresetType(type ?? null);
    setFormOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setPresetType(null);
    setFormOpen(true);
  };

  const onDelete = (tx: Transaction) => {
    void deleteMutation.mutateAsync(tx.id);
  };

  const onClear = () => setFilters(defaultFilters());

  return (
    <div className="space-y-6">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Gestão de gastos
          </h1>
          <p className="text-sm text-muted">
            Acompanhe entradas e saídas com filtros rápidos e edição instantânea.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-linear-to-br from-primary to-primary/70 text-bg shadow-glow-primary"
            onClick={() => openCreate("expense")}
            disabled={!readyForCreate}
          >
            <Plus className="h-4 w-4" />
            Adicionar gasto
          </Button>
          <Button variant="outline" onClick={() => openCreate("income")} disabled={!readyForCreate}>
            <Plus className="h-4 w-4" />
            Adicionar receita
          </Button>
        </div>
      </motion.div>

      {(categoriesQuery.isError || accountsQuery.isError) && (
        <ErrorState title="Não foi possível carregar categorias/contas" />
      )}

      <TransactionsSummary
        items={items}
        total={data?.total}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      <div className="space-y-4">
        <TransactionsFilters
          categories={categories}
          accounts={accounts}
          filters={filters}
          onChange={(next) => setFilters(next)}
          onClear={onClear}
        />

        {isError ? (
          <ErrorState title="Não foi possível carregar transações" />
        ) : (
          <>
            <TransactionsTable
              items={items}
              categories={categories}
              accounts={accounts}
              isLoading={isLoading}
              onEdit={openEdit}
              onDelete={onDelete}
            />

            <div className={cn("rounded-2xl border border-border bg-surface/40")}>
              <TransactionsPagination
                total={data?.total ?? 0}
                limit={filters.limit}
                offset={filters.offset}
                onOffsetChange={(next) => setFilters({ ...filters, offset: next })}
              />
            </div>
          </>
        )}
      </div>

      <TransactionFormSheet
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        editing={editing}
        presetType={presetType}
        categories={categories}
        accounts={accounts}
        onCreate={async (input) => {
          const created = await createMutation.mutateAsync(input);
          setFilters((prev) => {
            const next = { ...prev, offset: 0, sort: "newest" as const };
            if (prev.type && prev.type !== created.type) {
              toast.info(
                created.type === "income"
                  ? "Receita criada. Troque para a aba Receitas para vê-la na listagem filtrada."
                  : "Despesa criada. Troque para a aba Despesas para vê-la na listagem filtrada."
              );
              return next;
            }
            return next;
          });
          setFormOpen(false);
        }}
        onUpdate={async (id, input) => {
          await updateMutation.mutateAsync({ transactionId: id, input });
          setFormOpen(false);
        }}
      />

      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-primary text-bg shadow-glow-primary"
          onClick={() => openCreate("expense")}
          aria-label="Adicionar transação"
          disabled={!readyForCreate}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

