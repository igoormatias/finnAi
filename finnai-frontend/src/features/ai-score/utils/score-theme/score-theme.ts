export type ScoreTheme = {
  ring: string;
  glow: string;
  text: string;
  gradient: string;
  label: string;
};

export function getScoreTheme(score: number): ScoreTheme {
  if (score >= 80) {
    return {
      ring: "stroke-primary",
      glow: "shadow-[0_0_40px_rgba(53,224,161,0.35)]",
      text: "text-primary",
      gradient: "from-primary/20 via-surface to-elevated/40",
      label: "Excelente",
    };
  }
  if (score >= 50) {
    return {
      ring: "stroke-amber-400",
      glow: "shadow-[0_0_32px_rgba(251,191,36,0.25)]",
      text: "text-amber-400",
      gradient: "from-amber-500/10 via-surface to-elevated/40",
      label: "Em evolução",
    };
  }
  return {
    ring: "stroke-orange-500",
    glow: "shadow-[0_0_32px_rgba(249,115,22,0.25)]",
    text: "text-orange-400",
    gradient: "from-orange-500/10 via-surface to-elevated/40",
    label: "Atenção",
  };
}

export function getNextTierTarget(score: number): { target: number; label: string } {
  if (score < 50) return { target: 50, label: "Nível médio" };
  if (score < 80) return { target: 80, label: "Excelente controle" };
  return { target: 100, label: "Máximo" };
}

export function isScoreStale(generatedAt: string, staleDays = 7): boolean {
  const generated = new Date(generatedAt).getTime();
  const cutoff = Date.now() - staleDays * 24 * 60 * 60 * 1000;
  return generated < cutoff;
}
