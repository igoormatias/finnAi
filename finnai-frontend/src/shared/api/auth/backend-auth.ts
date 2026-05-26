import type { AuthResponse } from "@/features/auth/types";
import { getApiUrl } from "@/shared/config/env";
import { getSetCookieHeaders } from "@/shared/api/auth/cookies";

export type BackendAuthResult = {
  data: AuthResponse;
  setCookieHeaders: string[];
};

export async function exchangeGoogleIdToken(idToken: string): Promise<BackendAuthResult> {
  const response = await fetch(`${getApiUrl()}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Google authentication failed";
    throw new Error(detail);
  }

  const data = (await response.json()) as AuthResponse;
  return { data, setCookieHeaders: getSetCookieHeaders(response) };
}

export async function refreshWithCookie(refreshCookie: string): Promise<BackendAuthResult> {
  const cookieName = process.env.AUTH_COOKIE_NAME ?? "refresh_token";
  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `${cookieName}=${refreshCookie}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = typeof body.detail === "string" ? body.detail : "Session refresh failed";
    throw new Error(detail);
  }

  const data = (await response.json()) as AuthResponse;
  return { data, setCookieHeaders: getSetCookieHeaders(response) };
}

export async function fetchMe(accessToken: string): Promise<AuthResponse["user"]> {
  const response = await fetch(`${getApiUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return (await response.json()) as AuthResponse["user"];
}
