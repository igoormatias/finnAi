import * as React from "react";

import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";

export const Input = ({ className, type, ...props }: React.ComponentProps<"input">) => {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-elevated/30 px-3 py-2 text-sm text-foreground",
        "transition-colors placeholder:text-muted",
        "hover:border-border/80 hover:bg-elevated/40",
        "focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
        focusRingClass,
        className
      )}
      {...props}
    />
  );
};
