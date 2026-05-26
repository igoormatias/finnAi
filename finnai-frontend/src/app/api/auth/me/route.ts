import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { fetchMe } from "@/shared/api/auth/backend-auth";

export async function GET() {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await fetchMe(accessToken);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
}
