"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, MailWarning } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useAcceptInvite } from "@/features/workspaces";
import { listWorkspaces } from "../../services/workspace-service";
import { ApiError } from "@/shared/api/client";
import { ROUTES, workspaceDashboardPath } from "@/shared/config/routes";

type AcceptState = "loading" | "success" | "error";

export const AcceptInvitePage = ({ token }: { token: string }) => {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const acceptMutation = useAcceptInvite();
  const started = useRef(false);
  const [state, setState] = useState<AcceptState>("loading");
  const [errorMessage, setErrorMessage] = useState("Não foi possível aceitar o convite.");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(`/invites/${token}`);
      router.replace(`${ROUTES.login}?callbackUrl=${callbackUrl}`);
      return;
    }
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const membership = await acceptMutation.mutateAsync(token);
        setState("success");
        const workspaces = await listWorkspaces();
        const workspace = workspaces.find((w) => w.id === membership.workspace_id);
        const slug = workspace?.slug;
        setTimeout(() => {
          if (slug) router.replace(workspaceDashboardPath(slug));
          else router.replace(ROUTES.onboarding);
        }, 1500);
      } catch (err) {
        setState("error");
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        }
      }
    })();
  }, [acceptMutation, authLoading, isAuthenticated, router, token]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md border-border/80">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {(state === "loading" || authLoading || !isAuthenticated) && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Entrando no workspace…</p>
              <p className="text-sm text-muted">Validando seu convite</p>
            </>
          )}

          {state === "success" && (
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="grid gap-3"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-7 w-7" />
              </div>
              <p className="font-semibold">Convite aceito!</p>
              <p className="text-sm text-muted">Redirecionando para o dashboard…</p>
            </motion.div>
          )}

          {state === "error" && (
            <>
              <MailWarning className="h-10 w-10 text-danger" />
              <p className="font-semibold">Não foi possível aceitar</p>
              <p className="text-sm text-muted">{errorMessage}</p>
              <Button asChild>
                <Link href={ROUTES.dashboard}>Ir para o início</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
