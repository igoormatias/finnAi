import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = ({ className, type, ...props }: React.ComponentProps<"input">) => {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...props}
    />
  );
}
