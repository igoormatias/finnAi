import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  PiggyBank,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export type BadgeMeta = {
  icon: LucideIcon;
  glow: string;
  description: string;
};

const CATALOG: Record<string, BadgeMeta> = {
  "Economista Nato": {
    icon: PiggyBank,
    glow: "shadow-[0_0_20px_rgba(53,224,161,0.4)]",
    description: "Reserva e economia consistentes",
  },
  "Excelente Controle Financeiro": {
    icon: BadgeCheck,
    glow: "shadow-[0_0_20px_rgba(53,224,161,0.35)]",
    description: "Gestão sólida das finanças",
  },
  "Gastador Impulsivo": {
    icon: TrendingDown,
    glow: "shadow-[0_0_16px_rgba(249,115,22,0.3)]",
    description: "Oportunidade de reduzir gastos por impulso",
  },
  "Mestre da Reserva": {
    icon: Wallet,
    glow: "shadow-[0_0_20px_rgba(53,224,161,0.35)]",
    description: "Foco em guardar dinheiro",
  },
  "Investidor Inteligente": {
    icon: TrendingUp,
    glow: "shadow-[0_0_20px_rgba(96,165,250,0.35)]",
    description: "Visão de longo prazo",
  },
};

export function getBadgeMeta(name: string): BadgeMeta {
  return (
    CATALOG[name] ?? {
      icon: Award,
      glow: "shadow-[0_0_12px_rgba(53,224,161,0.2)]",
      description: "Conquista desbloqueada pela IA",
    }
  );
}

export const THINKING_MESSAGES = [
  "Analisando transações…",
  "Calculando padrões de gastos…",
  "Gerando insights personalizados…",
  "Montando seu FinnAI Score…",
] as const;
