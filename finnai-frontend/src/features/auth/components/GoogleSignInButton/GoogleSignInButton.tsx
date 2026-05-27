"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { useAuth } from "@/features/auth";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  label?: string;
  className?: string;
};

export const GoogleSignInButton = ({
  callbackUrl,
  label = "Entrar com Google",
  className,
}: GoogleSignInButtonProps) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await signInWithGoogle(callbackUrl);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
