import { AppShell } from "@/components/layout";
import { OnboardingGate } from "@/features/onboarding";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <OnboardingGate>{children}</OnboardingGate>
    </AppShell>
  );
}
