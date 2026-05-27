"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { parseBRLToCents, formatCentsInput } from "@/features/finance/utils/currency";

import type { Goal, GoalCreateInput, GoalPriority, GoalType } from "../../types";
import { GOAL_TYPE_OPTIONS } from "../../utils/goal-types";

type CreateGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Goal | null;
  onSubmit: (input: GoalCreateInput) => void;
  onContribution?: (amountCents: number) => void;
  isSubmitting?: boolean;
};

export const CreateGoalDialog = ({
  open,
  onOpenChange,
  initial,
  onSubmit,
  onContribution,
  isSubmitting,
}: CreateGoalDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("emergency_reserve");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contribution, setContribution] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setGoalType(initial?.goal_type ?? "emergency_reserve");
    setPriority(initial?.priority ?? "medium");
    setTargetAmount(initial ? formatCentsInput(initial.target_amount_cents) : "");
    setCurrentAmount(initial ? formatCentsInput(initial.current_amount_cents) : "");
    setTargetDate(initial?.target_date?.slice(0, 10) ?? "");
    setContribution("");
  }, [open, initial]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const target = parseBRLToCents(targetAmount);
    if (target <= 0) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      goal_type: goalType,
      target_amount_cents: target,
      current_amount_cents: parseBRLToCents(currentAmount),
      target_date: targetDate || null,
      priority,
    });
  };

  const handleContribution = () => {
    const amount = parseBRLToCents(contribution);
    if (amount <= 0 || !onContribution) return;
    onContribution(amount);
    setContribution("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar meta" : "Nova meta"}</DialogTitle>
        </DialogHeader>

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
              <Input
                id="goal-target"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted" htmlFor="goal-current">
                Valor atual
              </label>
              <Input
                id="goal-current"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted" htmlFor="goal-date">
              Data alvo
            </label>
            <Input
              id="goal-date"
              type="date"
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

          {initial && onContribution && initial.status === "active" && (
            <div className="rounded-xl border border-border bg-elevated/20 p-3">
              <p className="text-xs font-medium text-muted">Registrar aporte</p>
              <div className="mt-2 flex gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  aria-label="Valor do aporte"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleContribution}
                  disabled={isSubmitting}
                >
                  Aportar
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {initial ? "Salvar" : "Criar meta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
