"use client";

import { useMutation } from "@tanstack/react-query";

import { acceptInvite } from "../../services/invites-service";

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (token: string) => acceptInvite(token),
  });
}
