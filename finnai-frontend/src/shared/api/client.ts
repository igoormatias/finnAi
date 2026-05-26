"use client";

import { refreshAccessToken } from "@/features/auth/services/token-refresh-service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, headers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `/api/proxy/${normalizedPath}`;

  const buildHeaders = () => {
    const h = new Headers(headers);
    if (!skipAuth) {
      const token = useAuthStore.getState().accessToken;
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
    if (!h.has("Content-Type") && rest.body) {
      h.set("Content-Type", "application/json");
    }
    return h;
  };

  let response = await fetch(url, { ...rest, headers: buildHeaders() });

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      response = await fetch(url, { ...rest, headers: buildHeaders() });
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    const detail =
      body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
        ? body.detail
        : response.statusText;
    throw new ApiError(detail || "Request failed", response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
