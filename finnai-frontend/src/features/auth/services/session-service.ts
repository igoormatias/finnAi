import { getMe } from "@/features/auth/services/auth-service";
import type { AuthUser } from "@/features/auth/types";

export async function hydrateSession(): Promise<AuthUser | null> {
  try {
    return await getMe();
  } catch {
    return null;
  }
}
