/** Convenção FinnAI: todos os valores monetários são centavos inteiros (R$ 10,00 = 1000). */

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrencyBRL(cents: number): string {
  if (!Number.isFinite(cents)) return brlFormatter.format(0);
  return brlFormatter.format(cents / 100);
}

export function parseCurrencyBRL(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(/[R$\u00A0]/g, "");
  const only = normalized.replace(/[^\d,.-]/g, "");
  const withDot = only.replace(/\./g, "").replace(",", ".");
  const num = Number(withDot);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

export function maskCurrencyBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return formatCurrencyBRL(Number(digits));
}

export function centsToCurrencyInput(cents: number): string {
  return cents > 0 ? formatCurrencyBRL(cents) : "";
}

/** @deprecated Use formatCurrencyBRL */
export const formatCentsBRL = formatCurrencyBRL;

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatGrowthRate(rate: number): string {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${(rate * 100).toFixed(1)}%`;
}
