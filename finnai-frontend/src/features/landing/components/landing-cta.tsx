"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion/variants";
import { ROUTES } from "@/shared/config/routes";

export function LandingCta() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="px-4 py-16 md:py-20">
      <motion.div
        variants={reducedMotion ? undefined : fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-primary/10 p-8 text-center shadow-glow-primary md:p-12"
      >
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Pronto para elevar suas finanças?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Comece grátis com Google e configure seu workspace familiar em poucos passos.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={ROUTES.login}>Começar grátis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={ROUTES.login}>Entrar com Google</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
