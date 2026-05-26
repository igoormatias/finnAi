"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/shared/config/routes";

const LINKS = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#score", label: "Score" },
  { href: "#features", label: "Recursos" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary shadow-glow-primary">
            F
          </span>
          <span className="font-semibold tracking-tight">FinnAI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={ROUTES.login}>Entrar</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.login}>Começar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
