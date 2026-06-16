"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ErrorState } from "@/components/states";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui";
import { Input } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { PrivacyToggle, roleLabel, FinancialPreferencesSection } from "@/features/workspaces";
import {
  useDeleteWorkspace,
  useLeaveWorkspace,
  useUpdateWorkspace,
} from "@/features/workspaces";
import { useWorkspace } from "@/features/workspaces";
import { useWorkspacePermissions } from "@/features/workspaces";
import { useWorkspaceSlug } from "@/features/workspaces";
import { useWorkspaceUiStore } from "@/features/workspaces/store/workspace-ui-store";
import { workspacePath } from "@/shared/config/routes";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  "UTC",
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Fortaleza",
  "Europe/Lisbon",
] as const;

const schema = z.object({
  name: z.string().min(1, "Informe o nome").max(255),
  timezone: z.enum(TIMEZONES),
});

type FormValues = z.input<typeof schema>;

export const WorkspaceSettingsPage = () => {
  const slug = useWorkspaceSlug();
  const { data: workspace, isLoading, isError, refetch } = useWorkspace();
  const { can, currentRole } = useWorkspacePermissions();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const leaveWorkspace = useLeaveWorkspace();
  const privacy = useWorkspaceUiStore((s) => s.getPrivacy(slug));
  const setPrivacy = useWorkspaceUiStore((s) => s.setPrivacy);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", timezone: "UTC" },
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        timezone: (TIMEZONES.includes(workspace.timezone as (typeof TIMEZONES)[number])
          ? workspace.timezone
          : "UTC") as (typeof TIMEZONES)[number],
      });
    }
  }, [workspace, reset]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <ErrorState
        title="Não foi possível carregar as configurações."
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  const canEdit = can("editWorkspace");

  const onSubmit = handleSubmit(async (values) => {
    await updateWorkspace.mutateAsync({
      name: values.name,
      timezone: values.timezone,
    });
  });

  return (
    <section className="grid max-w-2xl gap-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Configurações do workspace</h1>
        <p className="text-sm text-muted">
          Papel atual: {currentRole ? roleLabel(currentRole) : "—"}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="ws-name" className="text-sm font-medium">
                Nome do workspace
              </label>
              <Input id="ws-name" disabled={!canEdit} {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <label htmlFor="ws-tz" className="text-sm font-medium">
                Fuso horário
              </label>
              <select
                id="ws-tz"
                disabled={!canEdit}
                className={cn(
                  "h-11 w-full cursor-pointer rounded-xl border border-border bg-elevated/40 px-3 text-sm",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                {...register("timezone")}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            {canEdit && (
              <Button type="submit" disabled={isSubmitting || updateWorkspace.isPending}>
                Salvar alterações
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <FinancialPreferencesSection />

      <Card>
        <CardHeader>
          <CardTitle>Preferências locais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PrivacyToggle
            label="Ocultar saldo de visualizadores"
            description="Preferência salva neste dispositivo até integração com API."
            checked={privacy.hideBalanceFromViewers}
            onCheckedChange={(checked) => setPrivacy(slug, { hideBalanceFromViewers: checked })}
          />
          <PrivacyToggle
            label="Permitir exportação de dados"
            checked={privacy.allowDataExport}
            onCheckedChange={(checked) => setPrivacy(slug, { allowDataExport: checked })}
          />
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-danger">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {can("leaveWorkspace") && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Sair do workspace</p>
                <p className="text-xs text-muted">Você perderá acesso a este workspace familiar.</p>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => setLeaveOpen(true)}
              >
                Sair do workspace
              </Button>
            </div>
          )}
          {can("deleteWorkspace") && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Excluir workspace</p>
                <p className="text-xs text-muted">Ação irreversível. Todos os dados serão removidos.</p>
              </div>
              <Button
                variant="destructive"
                type="button"
                onClick={() => setDeleteOpen(true)}
              >
                Excluir workspace
              </Button>
            </div>
          )}
          <Button variant="ghost" asChild className="justify-start px-0">
            <Link href={workspacePath(slug, "workspaces")}>Voltar ao hub</Link>
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Sair do workspace?"
        description="Você perderá acesso a este workspace familiar. Você pode ser convidado novamente depois."
        confirmText="Sair do workspace"
        variant="default"
        isConfirmLoading={leaveWorkspace.isPending}
        onConfirm={async () => {
          await leaveWorkspace.mutateAsync();
          setLeaveOpen(false);
        }}
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir workspace permanentemente?"
        description="Ação irreversível. Todos os dados serão removidos. Confirme digitando o nome do workspace."
        confirmText="Excluir workspace"
        variant="destructive"
        isConfirmLoading={deleteWorkspace.isPending}
        requiredText={workspace.name}
        confirmationLabel="Nome do workspace"
        onConfirm={async () => {
          await deleteWorkspace.mutateAsync();
          setDeleteOpen(false);
        }}
      />
    </section>
  );
}
