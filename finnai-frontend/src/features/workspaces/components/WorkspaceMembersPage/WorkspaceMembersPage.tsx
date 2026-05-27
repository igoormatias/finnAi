"use client";

import { MoreVertical, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { ErrorState } from "@/components/states";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Skeleton } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { InviteMemberDialog } from "@/features/workspaces";
import { Can } from "@/features/workspaces";
import { MemberAvatar } from "@/features/workspaces";
import { RoleBadge } from "@/features/workspaces";
import { WorkspaceEmptyState } from "@/features/workspaces";
import {
  useRemoveMember,
  useUpdateMemberRole,
  useWorkspaceMembers,
} from "@/features/workspaces";
import { useWorkspacePermissions } from "@/features/workspaces";
import { useWorkspaceSlug } from "@/features/workspaces";
import type { WorkspaceMember, WorkspaceRole } from "@/features/workspaces/types";
import { roleSubtitle } from "../../utils/role-labels";
import { workspacePath } from "@/shared/config/routes";

function formatJoined(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(date));
}

const MemberRowMobile = memo(function MemberRowMobile({
  member,
  onChangeRole,
  onRemove,
  canEdit,
  canRemove,
}: {
  member: WorkspaceMember;
  onChangeRole: (role: WorkspaceRole) => void;
  onRemove: () => void;
  canEdit: boolean;
  canRemove: boolean;
}) {
  const showMenu = canEdit || canRemove;
  const { assignableRoles } = useWorkspacePermissions();

  return (
    <Card className="border-border/80 bg-surface/60 transition-colors hover:border-primary/20">
      <CardContent className="flex items-start gap-3 p-4">
        <MemberAvatar name={member.user_name} email={member.user_email} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{member.user_name || member.user_email}</p>
              <p className="truncate text-xs text-muted">{member.user_email}</p>
              <p className="mt-1 text-xs text-muted">{roleSubtitle(member.role)}</p>
            </div>
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ações do membro">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit &&
                    assignableRoles.map((role) => (
                      <DropdownMenuItem key={role} onClick={() => onChangeRole(role)}>
                        Definir como {role}
                      </DropdownMenuItem>
                    ))}
                  {canRemove && (
                    <DropdownMenuItem className="text-danger" onClick={onRemove}>
                      Remover membro
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} />
            <Badge variant="success">Ativo</Badge>
            <span className="text-xs text-muted">Entrou em {formatJoined(member.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const WorkspaceMembersPage = () => {
  const slug = useWorkspaceSlug();
  const { data, isLoading, isError, refetch } = useWorkspaceMembers();
  const { canEditMember, canRemoveMember } = useWorkspacePermissions();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [inviteOpen, setInviteOpen] = useState(false);

  const members = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os membros."
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Membros</h1>
          <p className="text-sm text-muted">{members.length} membros ativos neste workspace</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={workspacePath(slug, "workspaces")}>Voltar ao hub</Link>
          </Button>
          <Can permission="invite">
            <Button type="button" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Convidar membro
            </Button>
          </Can>
        </div>
      </header>

      {members.length === 0 ? (
        <WorkspaceEmptyState
          icon={Users}
          title="Nenhum membro ainda"
          description="Convide sua família para colaborar nas finanças compartilhadas."
          actionLabel="Convidar membro"
          onAction={() => setInviteOpen(true)}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const canEdit = canEditMember(member.id);
                    const canRemove = canRemoveMember(member.id);
                    return (
                      <TableRow key={member.id} className="hover:bg-elevated/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <MemberAvatar name={member.user_name} email={member.user_email} />
                            <div>
                              <p className="font-medium">{member.user_name || "—"}</p>
                              <p className="text-xs text-muted">{roleSubtitle(member.role)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted">{member.user_email}</TableCell>
                        <TableCell>
                          <RoleBadge role={member.role} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Ativo</Badge>
                        </TableCell>
                        <TableCell className="text-muted">{formatJoined(member.created_at)}</TableCell>
                        <TableCell>
                          {(canEdit || canRemove) && (
                            <MemberActions
                              member={member}
                              canEdit={canEdit}
                              canRemove={canRemove}
                              onChangeRole={(role) =>
                                void updateRole.mutateAsync({ memberId: member.id, input: { role } })
                              }
                              onRemove={() => {
                                if (window.confirm("Remover este membro do workspace?")) {
                                  void removeMember.mutateAsync(member.id);
                                }
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="grid gap-3 md:hidden">
            {members.map((member) => (
              <MemberRowMobile
                key={member.id}
                member={member}
                canEdit={canEditMember(member.id)}
                canRemove={canRemoveMember(member.id)}
                onChangeRole={(role) =>
                  void updateRole.mutateAsync({ memberId: member.id, input: { role } })
                }
                onRemove={() => {
                  if (window.confirm("Remover este membro do workspace?")) {
                    void removeMember.mutateAsync(member.id);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </section>
  );
}

function MemberActions({
  member,
  canEdit,
  canRemove,
  onChangeRole,
  onRemove,
}: {
  member: WorkspaceMember;
  canEdit: boolean;
  canRemove: boolean;
  onChangeRole: (role: WorkspaceRole) => void;
  onRemove: () => void;
}) {
  const { assignableRoles } = useWorkspacePermissions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Ações para ${member.user_email}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit &&
          assignableRoles.map((role) => (
            <DropdownMenuItem key={role} onClick={() => onChangeRole(role)}>
              Definir como {role}
            </DropdownMenuItem>
          ))}
        {canRemove && (
          <DropdownMenuItem className="text-danger" onClick={onRemove}>
            Remover membro
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
