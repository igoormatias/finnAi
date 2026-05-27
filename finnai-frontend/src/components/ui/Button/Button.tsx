"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold",
    "transition-[color,background,transform,box-shadow] duration-200 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    focusRingClass
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-bg shadow-glow-primary hover:brightness-105 hover:shadow-[var(--glow-primary)]",
        secondary: "bg-elevated/60 text-foreground hover:bg-elevated",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/30 hover:bg-elevated/40",
        ghost: "bg-transparent text-foreground hover:bg-elevated/40",
        destructive: "bg-danger text-bg hover:brightness-105",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-4",
        lg: "h-12 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};
