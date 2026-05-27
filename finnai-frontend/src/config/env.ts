import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverEnvSchema = z.object({
  API_URL: z.string().url().optional(),
  AUTH_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function parseEnv<T extends z.ZodTypeAny>(schema: T, source: Record<string, string | undefined>) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid environment: ${message}`);
    }
    console.warn(`[env] ${message}`);
    return {} as z.infer<T>;
  }
  return result.data;
}

export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export const serverEnv = parseEnv(serverEnvSchema, {
  API_URL: process.env.API_URL,
  AUTH_URL: process.env.AUTH_URL,
});

export function getAppUrl() {
  return clientEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
