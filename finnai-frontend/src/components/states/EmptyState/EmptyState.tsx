import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export const EmptyState = ({
  title = "Nada por aqui ainda",
  description,
  className,
  action,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div
      role="status"
      className={cn(
        "grid place-items-center rounded-2xl border border-dashed border-border/80 bg-surface/40 p-8 text-center",
        className
      )}
    >
      <div className="flex max-w-sm flex-col items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-elevated/50 text-primary shadow-soft">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap justify-center gap-2">{action}</div>}
      </div>
    </div>
  );
};
