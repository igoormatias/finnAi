"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button, DateInput, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "@/components/ui";
import type { ExportFormat } from "../../types";
import { exportTransactions } from "../../services/reports-service";
import { downloadBlob } from "../../utils/download-blob";

export type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  defaultStartDate: Date;
  defaultEndDate: Date;
  defaultMode?: import("@/features/dashboard/types").ReportMode;
};

type ExportState = "idle" | "loading" | "success" | "error";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const ExportDialog = ({
  open,
  onOpenChange,
  slug,
  defaultStartDate,
  defaultEndDate,
  defaultMode = "historical",
}: ExportDialogProps) => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [state, setState] = useState<ExportState>("idle");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date>(() => startOfDay(defaultStartDate));
  const [endDate, setEndDate] = useState<Date>(() => endOfDay(defaultEndDate));

  const canExport = useMemo(() => startDate <= endDate && state !== "loading", [endDate, startDate, state]);

  const handleExport = async () => {
    if (!canExport) return;
    setState("loading");
    try {
      const { filename, blob } = await exportTransactions({
        slug,
        format,
        startDate,
        endDate,
        mode: defaultMode,
        type: type === "all" ? undefined : type,
        search: search.trim().length > 0 ? search.trim() : undefined,
      });
      downloadBlob(filename, blob);
      setState("success");
      toast.success("Exportação gerada com sucesso.");
    } catch (e) {
      setState("error");
      const message = e instanceof Error ? e.message : "Falha ao exportar.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Exportar transações</DialogTitle>
          <DialogDescription>
            Gere um arquivo CSV ou XLSX com base no período selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">Formato</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={[
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  format === "csv" ? "border-primary bg-elevated/60" : "border-border bg-elevated/30 hover:bg-elevated/50",
                ].join(" ")}
                aria-pressed={format === "csv"}
              >
                <FileText className="h-4 w-4 text-muted" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">CSV</p>
                  <p className="text-xs text-muted">Compatível com Google Sheets</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={[
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                  format === "xlsx" ? "border-primary bg-elevated/60" : "border-border bg-elevated/30 hover:bg-elevated/50",
                ].join(" ")}
                aria-pressed={format === "xlsx"}
              >
                <FileSpreadsheet className="h-4 w-4 text-muted" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">XLSX</p>
                  <p className="text-xs text-muted">Ideal para Excel</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">Tipo</p>
            <div className="inline-flex w-full rounded-xl border border-border bg-elevated/40 p-1">
              {(
                [
                  { id: "all", label: "Tudo" },
                  { id: "expense", label: "Despesas" },
                  { id: "income", label: "Receitas" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={[
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    type === opt.id ? "bg-primary text-bg" : "text-muted hover:text-foreground",
                  ].join(" ")}
                  aria-pressed={type === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="export-start">
                Início
              </label>
              <DateInput
                id="export-start"
                value={toDateInputValue(startDate)}
                onChange={(e) => setStartDate(startOfDay(new Date(e.target.value)))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="export-end">
                Fim
              </label>
              <DateInput
                id="export-end"
                value={toDateInputValue(endDate)}
                onChange={(e) => setEndDate(endOfDay(new Date(e.target.value)))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="export-search">
              Busca (opcional)
            </label>
            <Input
              id="export-search"
              placeholder="Ex.: mercado, aluguel, uber…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={!canExport}>
              <Download className="mr-2 h-4 w-4" />
              {state === "loading" ? "Gerando…" : state === "success" ? "Baixar novamente" : "Exportar"}
            </Button>
          </div>

          {startDate > endDate && (
            <p className="text-xs text-danger">
              A data inicial não pode ser maior do que a data final.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

