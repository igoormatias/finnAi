import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Nada por aqui ainda",
  description,
  className,
  action,
}: {
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-border bg-surface/50 p-8 text-center",
        className
      )}
    >
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {description && <div className="mt-1 text-sm text-muted">{description}</div>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

