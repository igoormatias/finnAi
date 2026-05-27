"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/ui";
import { fadeUp } from "@/lib/motion/variants";

export const LandingScoreSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section id="score" className="px-4 py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
        <motion.div
          variants={reducedMotion ? undefined : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4"
        >
          <Badge variant="primary">FinnAI Score</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Seu score financeiro com IA em tempo real
          </h2>
          <p className="text-muted">
            Receba pontuação, badges, pontos fortes e alertas com linguagem clara — inspirado na
            experiência do app (referência score-desktop).
          </p>
          <ul className="grid gap-2 text-sm text-muted">
            <li>• Score 0–100 com label contextual</li>
            <li>• Insights acionáveis e dicas personalizadas</li>
            <li>• Histórico e comparação mensal</li>
          </ul>
        </motion.div>

        <motion.div
          variants={reducedMotion ? undefined : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-surface/50 p-2 shadow-elevated"
        >
          <Image
            src="/assets/score-desktop.png"
            alt="Preview FinnAI Score"
            width={900}
            height={700}
            className="h-auto w-full rounded-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
