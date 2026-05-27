import { cn } from "@/lib/utils";

function initials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export const MemberAvatar = ({
  name,
  email,
  className,
}: {
  name: string | null;
  email: string | null;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary",
        className
      )}
      aria-hidden
    >
      {initials(name, email)}
    </div>
  );
}
