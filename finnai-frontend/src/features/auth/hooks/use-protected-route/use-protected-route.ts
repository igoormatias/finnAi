"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const callbackUrl = pathname + (searchParams.toString() ? `?${searchParams}` : "");
      router.replace(`${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);
}
