import { isGuestPath, isProtectedPath, ROUTES } from "@/shared/config/routes";

export function resolveAuthRedirect(
  pathname: string,
  isLoggedIn: boolean
): string | null {
  if (isProtectedPath(pathname) && !isLoggedIn) {
    return `${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`;
  }
  if (isGuestPath(pathname) && isLoggedIn) {
    return ROUTES.dashboard;
  }
  return null;
}
