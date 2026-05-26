import { NextResponse } from "next/server";

import { getRefreshCookieName } from "@/shared/api/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieName = getRefreshCookieName();
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
