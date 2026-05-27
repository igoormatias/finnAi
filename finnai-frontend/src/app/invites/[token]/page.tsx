import { AcceptInvitePage } from "@/features/workspaces";

export default async function InviteAcceptRoutePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <AcceptInvitePage token={token} />;
}
