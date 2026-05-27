import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export const LoadingState = ({ className }: { className?: string }) => {
  return (
    <div className={cn("grid gap-3", className)}>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

