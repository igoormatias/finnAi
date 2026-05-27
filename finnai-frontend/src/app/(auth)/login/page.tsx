import { Suspense } from "react";

import { AuthSkeleton } from "@/features/auth";
import { LoginContent } from "@/app/(auth)/login/login-content";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh px-4 py-10">
          <div className="mx-auto w-full max-w-sm">
            <AuthSkeleton />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
