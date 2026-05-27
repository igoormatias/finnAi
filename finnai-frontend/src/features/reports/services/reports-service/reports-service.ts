"use client";

import { refreshAccessToken } from "@/features/auth";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ApiError } from "@/shared/api/client";

import type { ExportFormat } from "../../types";

export type ExportParams = {
  slug: string;
  startDate: Date;
  endDate: Date;
  type?: "income" | "expense";
  categoryId?: string;
  accountId?: string;
  amountMinCents?: number;
  amountMaxCents?: number;
  search?: string;
};

type ExportResult = {
  filename: string;
  blob: Blob;
};

function toIsoParam(date: Date): string {
  return date.toISOString();
}

function parseFilenameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}

async function apiFetchBlob(path: string, init: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `/api/proxy/${normalizedPath}`;

  const buildHeaders = () => {
    const h = new Headers(init.headers);
    const token = useAuthStore.getState().accessToken;
    if (token) h.set("Authorization", `Bearer ${token}`);
    return h;
  };

  let response = await fetch(url, { ...init, headers: buildHeaders() });
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      response = await fetch(url, { ...init, headers: buildHeaders() });
    }
  }
  return response;
}

export async function exportTransactions({
  format,
  ...params
}: ExportParams & { format: ExportFormat }): Promise<ExportResult> {
  const qp = new URLSearchParams();
  qp.set("start_date", toIsoParam(params.startDate));
  qp.set("end_date", toIsoParam(params.endDate));
  if (params.type) qp.set("type", params.type);
  if (params.categoryId) qp.set("category_id", params.categoryId);
  if (params.accountId) qp.set("account_id", params.accountId);
  if (params.amountMinCents !== undefined) qp.set("amount_min_cents", String(params.amountMinCents));
  if (params.amountMaxCents !== undefined) qp.set("amount_max_cents", String(params.amountMaxCents));
  if (params.search) qp.set("search", params.search);

  const response = await apiFetchBlob(
    `/workspaces/${encodeURIComponent(params.slug)}/reports/export/${format}?${qp.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    const detail =
      body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
        ? body.detail
        : response.statusText;
    throw new ApiError(detail || "Request failed", response.status, body);
  }

  const blob = await response.blob();
  const filenameFromHeader = parseFilenameFromContentDisposition(
    response.headers.get("Content-Disposition")
  );
  const filename = filenameFromHeader ?? `transactions_export.${format}`;
  return { filename, blob };
}

