"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeUp, scaleIn } from "@/lib/motion/variants";
import { ROUTES } from "@/shared/config/routes";

export function LandingHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(53,224,161,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_40%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          variants={reducedMotion ? undefined : fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35 }}
          className="grid gap-6"
        >
          <p className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Inteligência financeira com IA
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Arquitetura da sua{" "}
            <span className="text-primary">liberdade financeira</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            Controle gastos, metas e relatórios com uma experiência premium. Workspace familiar,
            analytics e FinnAI Score em um só lugar.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.login}>Começar grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Ver recursos</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={reducedMotion ? undefined : scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative"
        >
          <div className="rounded-3xl border border-border bg-surface/50 p-2 shadow-elevated">
            <Image
              src="/assets/dashboard-desktop.png"
              alt="Preview do dashboard FinnAI"
              width={1200}
              height={800}
              className="h-auto w-full rounded-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
