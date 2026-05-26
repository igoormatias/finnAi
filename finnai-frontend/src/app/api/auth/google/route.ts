import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  applyBackendSetCookies,
  getRefreshCookieName,
} from "@/shared/api/auth/cookies";
import { exchangeGoogleIdToken } from "@/shared/api/auth/backend-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id_token?: string };
    if (!body.id_token) {
      return NextResponse.json({ detail: "id_token is required" }, { status: 400 });
    }

    const { data, setCookieHeaders } = await exchangeGoogleIdToken(body.id_token);
    const cookieStore = await cookies();
    const response = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      user: data.user,
    });

    applyBackendSetCookies(setCookieHeaders, response.cookies, getRefreshCookieName());
    // Also set on request cookie store for same-request reads
    applyBackendSetCookies(setCookieHeaders, cookieStore, getRefreshCookieName());

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ detail: message }, { status: 401 });
  }
}
