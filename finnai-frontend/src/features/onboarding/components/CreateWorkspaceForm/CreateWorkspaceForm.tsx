"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { createWorkspace } from "@/features/workspaces";
import { queryKeys } from "@/shared/api/query-keys";
import { workspaceDashboardPath } from "@/shared/config/routes";

const schema = z.object({
  name: z.string().min(1, "Informe o nome do workspace").max(255),
});

type FormValues = z.infer<typeof schema>;

export const CreateWorkspaceForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createWorkspace(values.name),
    onSuccess: async (workspace) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.categories(workspace.slug) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.finance.accounts(workspace.slug) });
      toast.success("Workspace criado com sucesso!");
      router.push(workspaceDashboardPath(workspace.slug));
    },
    onError: () => {
      toast.error("Não foi possível criar o workspace.");
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <label className="grid gap-2 text-sm">
        <span className="text-muted">Nome da família / workspace</span>
        <Input placeholder="Ex.: Família Silva" {...register("name")} />
        {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
      </label>

      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        Criar workspace e continuar
      </Button>
    </form>
  );
}
