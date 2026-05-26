import { AppShell } from "@/components/layout/app-shell";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <OnboardingGate>{children}</OnboardingGate>
    </AppShell>
  );
}
