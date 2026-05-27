"use client";

import { useMemo, useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from "@/components/ui";

export type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isConfirmLoading?: boolean;
  confirmationLabel?: string;
  confirmationPlaceholder?: string;
  requiredText?: string;
  onConfirm: () => void | Promise<void>;
};

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  variant = "default",
  isConfirmLoading,
  confirmationLabel = "Digite para confirmar",
  confirmationPlaceholder,
  requiredText,
  onConfirm,
}: ConfirmationDialogProps) => {
  const [typed, setTyped] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped("");
    onOpenChange(next);
  };

  const needsTyping = requiredText !== undefined && requiredText.length > 0;
  const canConfirm = useMemo(() => {
    if (isConfirmLoading) return false;
    if (!needsTyping) return true;
    return typed.trim() === requiredText;
  }, [isConfirmLoading, needsTyping, requiredText, typed]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {needsTyping && (
          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">{confirmationLabel}</p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmationPlaceholder ?? requiredText}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted">
              Confirme digitando exatamente: <span className="font-semibold text-foreground">{requiredText}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            type="button"
            onClick={() => void onConfirm()}
            disabled={!canConfirm}
          >
            {isConfirmLoading ? "Processando…" : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

