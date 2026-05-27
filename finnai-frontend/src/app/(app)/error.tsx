"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";
import { ErrorState } from "@/components/states";
import { PageContainer } from "@/components/layout/PageContainer";

export default function AppError({
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
    <PageContainer>
      <ErrorState
        title="Erro ao carregar esta área"
        description={error.message || "Tente atualizar a página."}
        action={
          <Button type="button" variant="outline" onClick={() => reset()}>
            Tentar novamente
          </Button>
        }
      />
    </PageContainer>
  );
}
