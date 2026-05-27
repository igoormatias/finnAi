"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useOnboardingStatus } from "@/features/onboarding";
import { LoadingState } from "@/components/states";
import { workspaceDashboardPath } from "@/shared/config/routes";
import { ROUTES } from "@/shared/config/routes";

export const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, needsOnboarding, data: workspaces } = useOnboardingStatus();

  useEffect(() => {
    if (isLoading) return;
    if (needsOnboarding && pathname !== ROUTES.onboarding) {
      router.replace(ROUTES.onboarding);
    }
    if (!needsOnboarding && pathname === ROUTES.onboarding && workspaces?.[0]) {
      router.replace(workspaceDashboardPath(workspaces[0].slug));
    }
  }, [isLoading, needsOnboarding, pathname, router, workspaces]);

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  return <>{children}</>;
}
