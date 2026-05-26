export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_active: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser & {
    created_at?: string;
    updated_at?: string;
  };
};

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
