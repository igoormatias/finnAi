export function parseBRLToCents(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(/[R$\u00A0]/g, "");
  const only = normalized.replace(/[^\d,.-]/g, "");
  const withDot = only.replace(/\./g, "").replace(",", ".");
  const num = Number(withDot);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

export function formatCentsInput(cents: number): string {
  const number = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

