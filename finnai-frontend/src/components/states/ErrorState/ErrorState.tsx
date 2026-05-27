import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const ErrorState = ({
  title = "Algo deu errado",
  description,
  className,
  action,
}: {
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "grid place-items-center rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center",
        className
      )}
    >
      <div className="flex max-w-sm flex-col items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
          <AlertCircle className="h-5 w-5" aria-hidden />
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
