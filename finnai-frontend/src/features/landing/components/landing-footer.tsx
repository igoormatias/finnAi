import Link from "next/link";

import { ROUTES } from "@/shared/config/routes";

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold">FinnAI</div>
          <p className="mt-1 text-sm text-muted">© {new Date().getFullYear()} FinnAI. Todos os direitos reservados.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <Link href={ROUTES.login} className="hover:text-foreground">
            Login
          </Link>
          <a href="#beneficios" className="hover:text-foreground">
            Benefícios
          </a>
          <a href="#score" className="hover:text-foreground">
            Score
          </a>
          <span className="text-muted/70">Twitter · LinkedIn (em breve)</span>
        </div>
      </div>
    </footer>
  );
}
