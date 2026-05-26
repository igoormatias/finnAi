"use client";

import { motion, useReducedMotion } from "framer-motion";

import { fadeUp } from "@/lib/motion/variants";

const FEATURES = [
  { title: "Controle financeiro", desc: "Contas, categorias e transações com saldo consistente." },
  { title: "Relatórios", desc: "Exportações e analytics por período e categoria." },
  { title: "IA", desc: "Score, resumos e recomendações com custo otimizado." },
  { title: "Colaboração familiar", desc: "Workspaces, convites e papéis (owner/admin/member/viewer)." },
];

export function LandingFeatures() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="features" className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Recursos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={reducedMotion ? undefined : fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-border bg-elevated/30 p-6"
            >
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
