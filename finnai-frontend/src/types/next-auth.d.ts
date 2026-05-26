import type { DefaultSession } from "next-auth";

import type { AuthUser } from "@/features/auth/types";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: AuthUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: AuthUser;
  }
}
