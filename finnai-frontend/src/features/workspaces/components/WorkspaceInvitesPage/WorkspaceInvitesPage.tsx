"use client";

import { Copy, Mail, RefreshCw, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/states";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { InviteMemberDialog } from "@/features/workspaces";
import { RoleBadge } from "@/features/workspaces";
import { WorkspaceEmptyState } from "@/features/workspaces";
import {
  useCancelInvite,
  useWorkspaceInvites,
} from "@/features/workspaces";
import { useWorkspacePermissions } from "@/features/workspaces";
import { useWorkspaceSlug } from "@/features/workspaces";
import type { WorkspaceInvite } from "@/features/workspaces/types";
import { buildInviteUrl } from "../../utils/invite-link";
import { getInviteStatus, inviteStatusLabel } from "../../utils/invite-status";
import { workspacePath } from "@/shared/config/routes";

function statusVariant(status: ReturnType<typeof getInviteStatus>) {
  if (status === "accepted") return "success" as const;
  if (status === "expired") return "danger" as const;
  return "warning" as const;
}

async function copyInviteLink(invite: WorkspaceInvite) {
  const url = buildInviteUrl(invite.token);
  await navigator.clipboard.writeText(url);
  toast.success("Link copiado para a área de transferência.");
}

export const WorkspaceInvitesPage = () => {
  const slug = useWorkspaceSlug();
  const { can } = useWorkspacePermissions();
  const { data, isLoading, isError, refetch } = useWorkspaceInvites();
  const cancelInvite = useCancelInvite();
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!can("invite")) {
    return (
      <WorkspaceEmptyState
        icon={Mail}
        title="Sem permissão"
        description="Apenas administradores podem gerenciar convites neste workspace."
        actionLabel="Voltar ao hub"
        onAction={() => {
          window.location.href = workspacePath(slug, "workspaces");
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os convites."
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  const invites = data ?? [];

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Convites</h1>
          <p className="text-sm text-muted">Gerencie convites pendentes e compartilhe links</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={workspacePath(slug, "workspaces")}>Voltar ao hub</Link>
          </Button>
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Novo convite
          </Button>
        </div>
      </header>

      {invites.length === 0 ? (
        <WorkspaceEmptyState
          icon={Mail}
          title="Nenhum convite"
          description="Convide pessoas por e-mail para participar do workspace familiar."
          actionLabel="Criar convite"
          onAction={() => setInviteOpen(true)}
        />
      ) : (
        <div className="grid gap-3">
          {invites.map((invite) => {
            const status = getInviteStatus(invite);
            const pending = status === "pending";
            return (
              <Card key={invite.id} className="border-border/80 bg-surface/60">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 grid gap-2">
                    <p className="truncate font-semibold">{invite.invited_email}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge role={invite.role} />
                      <Badge variant={statusVariant(status)}>{inviteStatusLabel(status)}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      Criado em{" "}
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
                        new Date(invite.created_at)
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => void copyInviteLink(invite)}
                        >
                          <Copy className="h-4 w-4" />
                          Copiar link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => void copyInviteLink(invite).then(() => toast.message("Link reenviado (copiado)."))}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Reenviar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            if (window.confirm("Cancelar este convite?")) {
                              void cancelInvite.mutateAsync(invite.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </section>
  );
}
