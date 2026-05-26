import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";

import type { AuthUser } from "@/features/auth/types";
import {
  applyBackendSetCookies,
  getRefreshCookieName,
} from "@/shared/api/auth/cookies";
import { exchangeGoogleIdToken } from "@/shared/api/auth/backend-auth";

function mapUser(raw: {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_active: boolean;
}): AuthUser {
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.name,
    avatar_url: raw.avatar_url,
    is_active: raw.is_active,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        const { data, setCookieHeaders } = await exchangeGoogleIdToken(account.id_token);
        const cookieStore = await cookies();
        applyBackendSetCookies(setCookieHeaders, cookieStore, getRefreshCookieName());

        token.accessToken = data.access_token;
        token.user = mapUser(data.user);
      }
      return token;
    },
    async session({ session, token }) {
      const authUser = token.user as AuthUser | undefined;
      if (authUser) {
        session.user = {
          ...session.user,
          ...authUser,
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          image: authUser.avatar_url ?? undefined,
        };
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  trustHost: true,
});
