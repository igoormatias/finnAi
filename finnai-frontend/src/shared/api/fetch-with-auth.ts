"use client";

import { handleSessionExpired, refreshAccessToken } from "@/features/auth";
import { useAuthStore } from "@/features/auth/store/auth-store";

export type FetchWithAuthOptions = {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export async function fetchWithAuthRetry(
  url: string,
  init: RequestInit,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuth, skipRefresh } = options;

  const buildHeaders = () => {
    const h = new Headers(init.headers);
    if (!skipAuth) {
      const token = useAuthStore.getState().accessToken;
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
    return h;
  };

  let response = await fetch(url, { ...init, headers: buildHeaders() });

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      response = await fetch(url, { ...init, headers: buildHeaders() });
    }
  }

  if (response.status === 401 && !skipAuth) {
    await handleSessionExpired();
  }

  return response;
}
