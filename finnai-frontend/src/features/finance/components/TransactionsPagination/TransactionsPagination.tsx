"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export const TransactionsPagination = ({
  total,
  limit,
  offset,
  onOffsetChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (next: number) => void;
}) => {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-xs text-muted">
      <Button
        size="sm"
        variant="ghost"
        disabled={!canPrev}
        onClick={() => onOffsetChange(Math.max(offset - limit, 0))}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className={cn("rounded-lg border border-border bg-elevated/30 px-3 py-2")}>
        Página {page} de {pageCount}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={!canNext}
        onClick={() => onOffsetChange(offset + limit)}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

