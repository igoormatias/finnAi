"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Input } from "@/components/ui";
import { useInviteMember } from "@/features/workspaces";
import { useWorkspacePermissions } from "@/features/workspaces";
import type { WorkspaceRole } from "@/features/workspaces/types";
import { roleLabel } from "../../utils/role-labels";
import { cn } from "@/lib/utils";

const schema = z.object({
  invited_email: z.string().email("Informe um e-mail válido"),
  role: z.enum(["admin", "member", "viewer"]),
});

type FormValues = z.input<typeof schema>;

export const InviteMemberDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const reduceMotion = useReducedMotion();
  const [success, setSuccess] = useState(false);
  const inviteMutation = useInviteMember();
  const { assignableRoles } = useWorkspacePermissions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { invited_email: "", role: "member" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSuccess(false);
      reset({ invited_email: "", role: "member" });
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    await inviteMutation.mutateAsync({
      invited_email: values.invited_email,
      role: values.role as Exclude<WorkspaceRole, "owner">,
    });
    setSuccess(true);
    setTimeout(() => onOpenChange(false), 1200);
  });

  const roles = assignableRoles.length > 0 ? assignableRoles : (["member"] as WorkspaceRole[]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail para colaborar neste workspace familiar.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-8 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-7 w-7" />
            </div>
            <p className="font-semibold">Convite criado com sucesso</p>
            <p className="text-sm text-muted">O link pode ser copiado na lista de convites.</p>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 pt-2">
            <div className="grid gap-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="nome@email.com"
                  className="pl-10"
                  {...register("invited_email")}
                />
              </div>
              {errors.invited_email && (
                <p className="text-xs text-danger">{errors.invited_email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="invite-role" className="text-sm font-medium">
                Papel
              </label>
              <select
                id="invite-role"
                className={cn(
                  "h-11 w-full cursor-pointer rounded-xl border border-border bg-elevated/40 px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                )}
                {...register("role")}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || inviteMutation.isPending} className="w-full">
              {isSubmitting || inviteMutation.isPending ? "Enviando…" : "Enviar convite"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
