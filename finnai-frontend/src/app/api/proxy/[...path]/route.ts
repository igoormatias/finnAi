import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getApiUrl } from "@/shared/config/env";

async function refreshAccessTokenFromCookie(request: Request): Promise<string | null> {
  const refreshUrl = new URL("/api/auth/refresh", request.url);
  const cookieHeader = request.headers.get("cookie");
  const refreshResponse = await fetch(refreshUrl, {
    method: "POST",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (!refreshResponse.ok) return null;

  const refreshBody = (await refreshResponse.json().catch(() => null)) as
    | { access_token?: string }
    | null;
  return refreshBody?.access_token ?? null;
}

async function proxyRequest(request: Request, pathSegments: string[]) {
  const session = await auth();
  const headerAuth = request.headers.get("authorization");
  let accessToken = headerAuth?.startsWith("Bearer ")
    ? headerAuth.slice(7)
    : session?.accessToken;

  if (!accessToken) {
    accessToken = (await refreshAccessTokenFromCookie(request)) ?? undefined;
    if (!accessToken) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
  }

  const path = pathSegments.join("/");
  const url = new URL(request.url);
  const target = `${getApiUrl()}/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  let backendResponse = await fetch(target, init);
  if (backendResponse.status === 401) {
    const refreshed = await refreshAccessTokenFromCookie(request);
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      backendResponse = await fetch(target, { ...init, headers });
    }
  }

  // 204 responses must not include a body.
  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = backendResponse.headers.get("Content-Type") ?? "application/json";
  const contentDisposition = backendResponse.headers.get("Content-Disposition");

  const responseHeaders: Record<string, string> = {
    "Content-Type": contentType,
  };
  if (contentDisposition) {
    responseHeaders["Content-Disposition"] = contentDisposition;
  }

  const isText =
    contentType.includes("application/json") ||
    contentType.startsWith("text/") ||
    contentType.includes("csv");

  if (isText) {
    const body = await backendResponse.text();
    return new NextResponse(body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  }

  const buf = await backendResponse.arrayBuffer();
  return new NextResponse(buf, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
