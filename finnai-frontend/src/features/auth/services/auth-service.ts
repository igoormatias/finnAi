import type { AuthResponse, AuthUser } from "@/features/auth/types";

export async function getMe(): Promise<AuthUser> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) {
    throw new Error("Failed to load session");
  }
  return (await response.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function loginWithIdToken(idToken: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "Login failed");
  }
  return (await response.json()) as AuthResponse;
}
