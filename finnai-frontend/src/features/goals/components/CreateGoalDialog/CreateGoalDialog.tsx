"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { CurrencyInput } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { centsToCurrencyInput, parseCurrencyBRL } from "@/lib/formatters/money";

import type { Goal, GoalCreateInput, GoalPriority, GoalType } from "../../types";
import { GOAL_TYPE_OPTIONS } from "../../utils/goal-types";

type CreateGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Goal | null;
  formKey: number;
  onSubmit: (input: GoalCreateInput) => void;
  isSubmitting?: boolean;
};

function CreateGoalForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: Goal | null;
  onSubmit: (input: GoalCreateInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [name, setName] = useState(() => initial?.name ?? "");
  const [description, setDescription] = useState(() => initial?.description ?? "");
  const [goalType, setGoalType] = useState<GoalType>(() => initial?.goal_type ?? "emergency_reserve");
  const [priority, setPriority] = useState<GoalPriority>(() => initial?.priority ?? "medium");
  const [targetAmount, setTargetAmount] = useState(() =>
    initial ? centsToCurrencyInput(initial.target_amount_cents) || "" : ""
  );
  const [currentAmount, setCurrentAmount] = useState(() =>
    initial && initial.current_amount_cents > 0
      ? centsToCurrencyInput(initial.current_amount_cents)
      : ""
  );
  const [targetDate, setTargetDate] = useState(() => initial?.target_date?.slice(0, 10) ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    const target = parseCurrencyBRL(targetAmount);
    if (target <= 0) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      goal_type: goalType,
      target_amount_cents: target,
      current_amount_cents: parseCurrencyBRL(currentAmount),
      target_date: targetDate || null,
      priority,
    });
  };

  return (
    <div className="grid gap-4 pr-2">
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="goal-name">
          Nome
        </label>
        <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted">Tipo</label>
          <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOAL_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted">Prioridade</label>
          <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted" htmlFor="goal-target">
            Valor alvo
          </label>
          <CurrencyInput id="goal-target" value={targetAmount} onChange={setTargetAmount} />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium text-muted" htmlFor="goal-current">
            Valor atual
          </label>
          <CurrencyInput id="goal-current" value={currentAmount} onChange={setCurrentAmount} />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="goal-date">
          Data alvo
        </label>
        <Input
          id="goal-date"
          type="date"
          className="scheme-light dark:scheme-dark"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted" htmlFor="goal-desc">
          Descrição
        </label>
        <textarea
          id="goal-desc"
          className="min-h-[80px] w-full rounded-xl border border-border bg-elevated/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {initial ? "Salvar" : "Criar meta"}
        </Button>
      </div>
    </div>
  );
}

export const CreateGoalDialog = ({
  open,
  onOpenChange,
  initial,
  formKey,
  onSubmit,
  isSubmitting,
}: CreateGoalDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar meta" : "Nova meta"}</DialogTitle>
        </DialogHeader>

        {open ? (
          <CreateGoalForm
            key={formKey}
            initial={initial}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
