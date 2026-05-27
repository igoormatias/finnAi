import { CreateWorkspaceForm } from "@/features/onboarding";

export default function OnboardingPage() {
  return (
    <section className="mx-auto grid max-w-lg gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bem-vindo ao FinnAI</h1>
        <p className="mt-1 text-sm text-muted">
          Crie seu primeiro workspace familiar para começar a organizar suas finanças.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/60 p-5 shadow-soft">
        <CreateWorkspaceForm />
      </div>
    </section>
  );
}
