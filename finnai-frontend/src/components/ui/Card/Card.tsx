import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border border-border bg-surface/60 shadow-soft transition-[border-color,box-shadow,transform] duration-200 ease-out",
  {
    variants: {
      interactive: {
        true: "hover:border-primary/25 hover:shadow-elevated hover:-translate-y-px",
        false: "",
      },
      density: {
        default: "",
        compact: "",
      },
    },
    defaultVariants: {
      interactive: false,
      density: "default",
    },
  }
);

export type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export const Card = ({ className, interactive, density, ...props }: CardProps) => {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ interactive, density }), className)}
      {...props}
    />
  );
};

export const CardHeader = ({
  className,
  density = "default",
  ...props
}: React.ComponentProps<"div"> & { density?: "default" | "compact" }) => {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1", density === "compact" ? "p-3" : "p-4", className)}
      {...props}
    />
  );
};

export const CardTitle = ({ className, ...props }: React.ComponentProps<"p">) => {
  return (
    <p
      data-slot="card-title"
      className={cn("text-sm font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
};

export const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => {
  return (
    <p data-slot="card-description" className={cn("text-sm text-muted", className)} {...props} />
  );
};

export const CardContent = ({
  className,
  density = "default",
  ...props
}: React.ComponentProps<"div"> & { density?: "default" | "compact" }) => {
  return (
    <div
      data-slot="card-content"
      className={cn(density === "compact" ? "px-3 pb-3 pt-0" : "p-4 pt-0", className)}
      {...props}
    />
  );
};

export const CardFooter = ({
  className,
  density = "default",
  ...props
}: React.ComponentProps<"div"> & { density?: "default" | "compact" }) => {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        density === "compact" ? "px-3 pb-3 pt-0" : "p-4 pt-0",
        className
      )}
      {...props}
    />
  );
};
