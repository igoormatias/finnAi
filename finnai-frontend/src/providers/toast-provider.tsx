"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "bg-elevated/90 border border-border text-foreground backdrop-blur-md",
          title: "text-foreground",
          description: "text-muted",
        },
      }}
    />
  );
}

