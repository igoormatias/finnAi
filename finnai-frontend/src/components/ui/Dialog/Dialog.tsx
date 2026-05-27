"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { focusRingClass } from "@/lib/design/focus-classes";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
};

export const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface/90 p-5 shadow-elevated backdrop-blur-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:duration-200 data-[state=open]:duration-200",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated/40 text-muted transition-colors hover:bg-elevated hover:text-foreground",
            focusRingClass
          )}
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("grid gap-1.5 pr-8", className)} {...props} />;
};

export const DialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => {
  return (
    <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />
  );
};

export const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => {
  return <DialogPrimitive.Description className={cn("text-sm text-muted", className)} {...props} />;
};
