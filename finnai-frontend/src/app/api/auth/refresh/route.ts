import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  applyBackendSetCookies,
  getRefreshCookieName,
} from "@/shared/api/auth/cookies";
import { refreshWithCookie } from "@/shared/api/auth/backend-auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieName = getRefreshCookieName();
    const refreshToken = cookieStore.get(cookieName)?.value;

    if (!refreshToken) {
      return NextResponse.json({ detail: "Refresh token missing" }, { status: 401 });
    }

    const { data, setCookieHeaders } = await refreshWithCookie(refreshToken);
    const response = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      user: data.user,
    });

    applyBackendSetCookies(setCookieHeaders, response.cookies, cookieName);
    applyBackendSetCookies(setCookieHeaders, cookieStore, cookieName);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    return NextResponse.json({ detail: message }, { status: 401 });
  }
}
