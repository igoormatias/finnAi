import * as React from "react";

import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card"
      className={cn("rounded-2xl border border-border bg-surface/60 shadow-soft", className)}
      {...props}
    />
  );
}

export const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1 p-4", className)} {...props} />;
}

export const CardTitle = ({ className, ...props }: React.ComponentProps<"p">) => {
  return (
    <p
      data-slot="card-title"
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => {
  return (
    <p data-slot="card-description" className={cn("text-sm text-muted", className)} {...props} />
  );
}

export const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="card-content" className={cn("p-4 pt-0", className)} {...props} />;
}

export const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div data-slot="card-footer" className={cn("flex items-center p-4 pt-0", className)} {...props} />
  );
}
