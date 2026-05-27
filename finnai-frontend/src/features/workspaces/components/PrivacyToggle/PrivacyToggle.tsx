"use client";

import { cn } from "@/lib/utils";

export const PrivacyToggle = ({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors",
          checked ? "border-primary bg-primary" : "border-border bg-elevated/60"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-bg shadow transition-transform",
            checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
