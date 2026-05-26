export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatBucketLabel(iso: string, granularity: string): string {
  const date = new Date(iso);
  if (granularity === "monthly") {
    return date.toLocaleDateString("pt-BR", { month: "short" });
  }
  if (granularity === "weekly") {
    return `Sem ${date.getDate()}`;
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
