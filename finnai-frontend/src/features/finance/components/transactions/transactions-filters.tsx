"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Account, Category, TransactionType, TransactionsFilters } from "@/features/finance/types/finance-types";
import { cn } from "@/lib/utils";

type FiltersProps = {
  categories: Category[];
  accounts: Account[];
  filters: TransactionsFilters;
  onChange: (next: TransactionsFilters) => void;
  onClear: () => void;
};

function chip(label: string, onClear: () => void) {
  return (
    <Badge
      key={label}
      className="gap-1 border-border bg-elevated/40 pr-1 text-foreground"
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-elevated"
        aria-label={`Remover filtro ${label}`}
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Badge>
  );
}

export function TransactionsFilters({ categories, accounts, filters, onChange, onClear }: FiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");

  const activeChips = useMemo(() => {
    const chips: React.ReactNode[] = [];
    if (filters.type) {
      chips.push(
        chip(filters.type === "expense" ? "Despesa" : "Receita", () =>
          onChange({ ...filters, type: undefined })
        )
      );
    }
    if (filters.category_id) {
      const category = categories.find((c) => c.id === filters.category_id);
      chips.push(
        chip(category?.name ?? "Categoria", () =>
          onChange({ ...filters, category_id: undefined })
        )
      );
    }
    if (filters.account_id) {
      const account = accounts.find((a) => a.id === filters.account_id);
      chips.push(
        chip(account?.name ?? "Conta", () => onChange({ ...filters, account_id: undefined }))
      );
    }
    if (filters.recurring !== undefined) {
      chips.push(
        chip(filters.recurring ? "Recorrentes" : "Não recorrentes", () =>
          onChange({ ...filters, recurring: undefined })
        )
      );
    }
    if (filters.search) {
      chips.push(chip(`Busca: ${filters.search}`, () => onChange({ ...filters, search: undefined })));
    }
    return chips;
  }, [accounts, categories, filters, onChange]);

  const setType = (type: TransactionType | undefined) => onChange({ ...filters, type, offset: 0 });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[380px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onChange({ ...filters, search: searchDraft || undefined, offset: 0 });
            }}
            placeholder="Buscar transação…"
            className="pl-9"
            aria-label="Buscar transação"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-border bg-elevated/40 p-1">
            {[
              { id: undefined, label: "Todas" },
              { id: "expense" as const, label: "Despesas" },
              { id: "income" as const, label: "Receitas" },
            ].map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setType(opt.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filters.type === opt.id ? "bg-primary text-bg" : "text-muted hover:text-foreground"
                )}
                aria-pressed={filters.type === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            className="h-10 rounded-xl border border-border bg-elevated/40 px-3 text-xs font-semibold text-foreground outline-none hover:bg-elevated/60"
            aria-label="Ordenação"
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.currentTarget.value as TransactionsFilters["sort"], offset: 0 })
            }
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="amount_desc">Maior valor</option>
            <option value="amount_asc">Menor valor</option>
          </select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Filtros</div>
                <Button variant="ghost" size="sm" onClick={onClear}>
                  Limpar
                </Button>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-muted">Recorrência</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: undefined, label: "Todas" },
                      { id: true, label: "Recorrentes" },
                      { id: false, label: "Não recorrentes" },
                    ].map((opt) => (
                      <button
                        key={String(opt.id)}
                        type="button"
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                          filters.recurring === opt.id
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-elevated/30 text-foreground hover:bg-elevated/50"
                        )}
                        onClick={() =>
                          onChange({
                            ...filters,
                            recurring: opt.id,
                            offset: 0,
                          })
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted">Categoria</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                          filters.category_id === c.id
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-elevated/30 text-foreground hover:bg-elevated/50"
                        )}
                        onClick={() =>
                          onChange({
                            ...filters,
                            category_id: filters.category_id === c.id ? undefined : c.id,
                            offset: 0,
                          })
                        }
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted">Conta</div>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                          filters.account_id === a.id
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-elevated/30 text-foreground hover:bg-elevated/50"
                        )}
                        onClick={() =>
                          onChange({
                            ...filters,
                            account_id: filters.account_id === a.id ? undefined : a.id,
                            offset: 0,
                          })
                        }
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {activeChips.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      {activeChips.length > 0 && <div className="flex flex-wrap gap-2">{activeChips}</div>}
    </div>
  );
}

