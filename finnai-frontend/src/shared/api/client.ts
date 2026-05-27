"use client";

import { fetchWithAuthRetry } from "@/shared/api/fetch-with-auth";

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

  const init: RequestInit = { ...rest, headers };
  if (!skipAuth) {
    const h = new Headers(headers);
    if (!h.has("Content-Type") && rest.body) {
      h.set("Content-Type", "application/json");
    }
    init.headers = h;
  }

  const response = await fetchWithAuthRetry(url, init, { skipAuth, skipRefresh });

  if (response.status === 401 && !skipAuth) {
    throw new ApiError("Sessão expirada", 401);
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
