"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ApiError } from "@/shared/api/client";
import { setQueryClient } from "@/shared/api/query-client-holder";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status === 401) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      })
  );

  useEffect(() => {
    setQueryClient(client);
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
