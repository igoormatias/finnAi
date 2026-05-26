type CookieStore = {
  set: (
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      path?: string;
      maxAge?: number;
    }
  ) => void;
};

const REFRESH_COOKIE_DEFAULT = "refresh_token";

export function getRefreshCookieName(): string {
  return process.env.AUTH_COOKIE_NAME ?? REFRESH_COOKIE_DEFAULT;
}

/** Parse Set-Cookie header value into parts for Next.js cookies().set */
export function parseSetCookieHeader(setCookie: string): {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
} | null {
  const parts = setCookie.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eq = nameValue.indexOf("=");
  if (eq === -1) return null;

  const name = nameValue.slice(0, eq);
  const value = nameValue.slice(eq + 1);

  const options: ReturnType<typeof parseSetCookieHeader> = { name, value };

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === "httponly") options.httpOnly = true;
    else if (lower === "secure") options.secure = true;
    else if (lower.startsWith("max-age=")) {
      options.maxAge = Number.parseInt(attr.split("=")[1] ?? "0", 10);
    } else if (lower.startsWith("path=")) options.path = attr.split("=")[1];
    else if (lower.startsWith("samesite=")) {
      const site = attr.split("=")[1]?.toLowerCase();
      if (site === "strict" || site === "none" || site === "lax") {
        options.sameSite = site;
      }
    }
  }

  return options;
}

export function applyBackendSetCookies(
  setCookieHeaders: string[],
  cookieStore: CookieStore,
  cookieNameFilter?: string
): void {
  const filter = cookieNameFilter ?? getRefreshCookieName();

  for (const header of setCookieHeaders) {
    const parsed = parseSetCookieHeader(header);
    if (!parsed || parsed.name !== filter) continue;

    cookieStore.set(parsed.name, parsed.value, {
      httpOnly: parsed.httpOnly ?? true,
      secure: parsed.secure ?? process.env.NODE_ENV === "production",
      sameSite: parsed.sameSite ?? "lax",
      path: parsed.path ?? "/",
      maxAge: parsed.maxAge,
    });
  }
}

export function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}
