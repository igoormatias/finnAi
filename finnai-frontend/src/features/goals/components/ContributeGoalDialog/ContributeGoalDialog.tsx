"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { CurrencyInput } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Input } from "@/components/ui";
import { parseCurrencyBRL } from "@/lib/formatters/money";

import type { Goal, GoalContributionInput } from "../../types";

type ContributeGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  formKey: number;
  onSubmit: (input: GoalContributionInput) => void;
  isSubmitting?: boolean;
};

function ContributeGoalForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (input: GoalContributionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [contributedAt, setContributedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const amountCents = parseCurrencyBRL(amount);
    if (amountCents <= 0) return;
    onSubmit({
      amount_cents: amountCents,
      contributed_at: contributedAt || null,
      notes: notes.trim() ? notes.trim() : null,
    });
  };

  return (
    <div className="grid gap-4 pr-2">
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="contribution-amount">
          Valor
        </label>
        <CurrencyInput
          id="contribution-amount"
          value={amount}
          onChange={setAmount}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="contribution-date">
          Data
        </label>
        <Input
          id="contribution-date"
          type="date"
          className="scheme-light dark:scheme-dark"
          value={contributedAt}
          onChange={(e) => setContributedAt(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="contribution-notes">
          Observação (opcional)
        </label>
        <textarea
          id="contribution-notes"
          maxLength={2000}
          className="min-h-[80px] w-full rounded-xl border border-border bg-elevated/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="Ex: bônus do trabalho"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Aportando…" : "Confirmar aporte"}
        </Button>
      </div>
    </div>
  );
}

export const ContributeGoalDialog = ({
  open,
  onOpenChange,
  goal,
  formKey,
  onSubmit,
  isSubmitting,
}: ContributeGoalDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aportar em {goal?.name ?? "meta"}</DialogTitle>
        </DialogHeader>

        {open ? (
          <ContributeGoalForm
            key={formKey}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
