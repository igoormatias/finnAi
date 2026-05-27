"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "bg-elevated/95 border border-border text-foreground backdrop-blur-md shadow-elevated",
          title: "text-foreground font-medium",
          description: "text-muted",
          actionButton: "bg-primary text-bg",
          cancelButton: "bg-elevated text-foreground",
          closeButton: "border-border bg-elevated/60 text-muted hover:text-foreground",
        },
      }}
    />
  );
}
