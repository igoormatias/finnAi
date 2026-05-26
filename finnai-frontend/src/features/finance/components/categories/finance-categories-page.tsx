"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/finance/hooks/use-categories";
import type { Category, CategoryType } from "@/features/finance/types/finance-types";
import { cn } from "@/lib/utils";

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border-border/80 bg-surface/60 transition-all hover:border-primary/30 hover:shadow-glow-primary/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate">{category.name}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant={category.type === "expense" ? "danger" : "success"}
              className="uppercase"
            >
              {category.type === "expense" ? "Despesa" : "Receita"}
            </Badge>
            {category.is_fixed && <Badge variant="primary">Fixa</Badge>}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-label={`Cor ${category.color}`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Excluir categoria">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted">Ícone: {category.icon}</div>
      </CardContent>
    </Card>
  );
}

function CategoryModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Category | null;
  onSubmit: (values: { name: string; type: CategoryType; color: string; icon: string; is_fixed: boolean }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CategoryType>(initial?.type ?? "expense");
  const [color, setColor] = useState(initial?.color ?? "#64748b");
  const [icon, setIcon] = useState(initial?.icon ?? "tag");
  const [isFixed, setIsFixed] = useState(initial?.is_fixed ?? false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-foreground">
            {initial ? "Editar categoria" : "Nova categoria"}
          </div>
          <div className="text-sm text-muted">Organize sua gestão diária com cores e tipos.</div>
        </div>

        <div className="grid gap-3">
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
                    type === opt.id ? "bg-primary text-bg" : "text-muted hover:text-foreground"
                  )}
                  onClick={() => setType(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted">Nome</label>
            <Input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Ex: Alimentação" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Cor</label>
              <Input value={color} onChange={(e) => setColor(e.currentTarget.value)} placeholder="#35e0a1" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted">Ícone</label>
              <Input value={icon} onChange={(e) => setIcon(e.currentTarget.value)} placeholder="tag" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.currentTarget.checked)} />
            Categoria fixa
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit({ name, type, color, icon, is_fixed: isFixed });
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

export function FinanceCategoriesPage() {
  const { data, isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const categories = data ?? [];
  const byType = useMemo(
    () => ({
      expense: categories.filter((c) => c.type === "expense"),
      income: categories.filter((c) => c.type === "income"),
    }),
    [categories]
  );

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState title="Não foi possível carregar categorias" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Categorias
          </h1>
          <p className="text-sm text-muted">Crie e mantenha categorias com cores e ícones.</p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {!isLoading && categories.length === 0 && (
        <EmptyState
          title="Sem categorias"
          description="Crie sua primeira categoria para começar a organizar as transações."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Criar categoria
            </Button>
          }
        />
      )}

      {categories.length > 0 && (
        <div className="grid gap-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Despesas</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {byType.expense.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => {
                    setEditing(category);
                    setOpen(true);
                  }}
                  onDelete={() => void deleteMutation.mutateAsync(category.id)}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Receitas</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {byType.income.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => {
                    setEditing(category);
                    setOpen(true);
                  }}
                  onDelete={() => void deleteMutation.mutateAsync(category.id)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      <CategoryModal
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={(values) => {
          if (editing) {
            const { type: _type, ...updateValues } = values;
            void updateMutation.mutateAsync({ categoryId: editing.id, input: updateValues });
          } else {
            void createMutation.mutateAsync(values);
          }
        }}
      />
    </div>
  );
}

