"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";
import { ErrorState } from "@/components/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <ErrorState
        title="Não foi possível carregar a página"
        description="Ocorreu um erro inesperado. Tente novamente."
        action={
          <Button type="button" onClick={() => reset()}>
            Tentar novamente
          </Button>
        }
      />
    </div>
  );
}
