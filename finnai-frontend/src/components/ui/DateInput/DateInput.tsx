"use client";

import { Calendar } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Input } from "../Input";

type DateInputProps = React.ComponentProps<typeof Input> & {
  showIcon?: boolean;
};

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, showIcon = false, ...props }, ref) => {
    return (
      <div className="relative w-full min-w-0 max-w-full">
        {showIcon ? (
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        ) : null}
        <Input
          ref={ref}
          type="date"
          className={cn(showIcon && "pl-9", className)}
          {...props}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
