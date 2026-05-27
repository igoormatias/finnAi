"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { GoogleSignInButton } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

export function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.dashboard;
  const error = searchParams.get("error");

  return (
    <div className="min-h-dvh bg-bg px-4 py-10 text-foreground">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface/40 shadow-elevated md:grid-cols-2">
        <div className="relative hidden min-h-[560px] flex-col justify-between p-8 md:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div>
            <Link
              href={ROUTES.home}
              className="relative inline-flex items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary shadow-glow-primary">
                F
              </span>
              <span className="text-sm font-semibold tracking-tight">FinnAI</span>
            </Link>

            <h1 className="relative mt-10 text-4xl font-semibold leading-tight tracking-tight">
              Arquitetura da sua{" "}
              <span className="text-primary">liberdade financeira.</span>
            </h1>
            <p className="relative mt-4 max-w-md text-sm leading-6 text-muted">
              Transforme dados complexos em decisões inteligentes com uma interface de gestão
              financeira moderna e responsiva.
            </p>
          </div>

          <div className="relative rounded-2xl border border-border bg-elevated/30 p-4 text-xs text-muted">
            Gestão financeira com IA, workspaces familiares e FinnAI Score.
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="md:hidden">
              <Link
                href={ROUTES.home}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-elevated/40 px-3 py-2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary shadow-glow-primary">
                  F
                </span>
                <span className="text-sm font-semibold tracking-tight">FinnAI</span>
              </Link>
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-tight md:mt-0">
              Entrar com Google
            </h2>
            <p className="mt-1 text-sm text-muted">
              Acesse sua inteligência financeira com um clique.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                Falha na autenticação. Tente novamente.
              </p>
            )}

            <div className="mt-6 grid gap-3">
              <GoogleSignInButton callbackUrl={callbackUrl} className="h-11 w-full" />

              <p className="text-center text-xs leading-5 text-muted">
                Ao continuar, você concorda com os termos de uso e a política de privacidade.
              </p>

              <p className="mt-2 text-center text-xs text-muted">
                <Link href={ROUTES.home} className="font-semibold text-primary">
                  Voltar para a landing
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
