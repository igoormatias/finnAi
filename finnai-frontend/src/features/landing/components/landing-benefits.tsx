"use client";

import { BarChart3, Brain, Gauge, Target, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { fadeUp } from "@/lib/motion/variants";

const ITEMS = [
  { icon: Brain, title: "IA financeira", desc: "Insights e recomendações personalizadas." },
  { icon: Users, title: "Workspace familiar", desc: "Finanças compartilhadas com papéis e convites." },
  { icon: BarChart3, title: "Analytics", desc: "Dashboards e relatórios com visão clara." },
  { icon: Target, title: "Metas", desc: "Acompanhe objetivos e progresso mensal." },
  { icon: Gauge, title: "FinnAI Score", desc: "Score 0–100 com pontos fortes e alertas." },
];

export function LandingBenefits() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="beneficios" className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Benefícios</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Tudo que você precisa para transformar dados em decisões — com UX premium e responsiva.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              variants={reducedMotion ? undefined : fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-surface/50 p-5 shadow-soft"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
