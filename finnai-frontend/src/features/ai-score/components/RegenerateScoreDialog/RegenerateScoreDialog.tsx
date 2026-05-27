"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

type RegenerateScoreDialogProps = {
  onConfirm: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export const RegenerateScoreDialog = ({
  onConfirm,
  disabled,
  isLoading,
}: RegenerateScoreDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="cursor-pointer gap-2"
          aria-label="Regenerar FinnAI Score"
        >
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
          Regenerar score
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerar FinnAI Score?</DialogTitle>
          <DialogDescription>
            A IA vai reanalisar suas finanças e atualizar pontuação, badges e recomendações. Pode
            levar até um minuto.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Iniciando…" : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
