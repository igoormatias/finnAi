import { AuthSkeleton } from "@/features/auth/components/auth-skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto w-full max-w-sm">
        <AuthSkeleton />
      </div>
    </div>
  );
}
