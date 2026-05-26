import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resolveAuthRedirect } from "@/shared/config/middleware-utils";

export default auth((req) => {
  const redirectPath = resolveAuthRedirect(req.nextUrl.pathname, !!req.auth);
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
