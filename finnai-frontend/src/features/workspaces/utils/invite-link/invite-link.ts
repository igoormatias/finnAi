export function buildInviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalized}/invites/${token}`;
}
