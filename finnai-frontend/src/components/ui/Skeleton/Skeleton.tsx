import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  shimmer?: boolean;
};

export const Skeleton = ({ className, shimmer = true, ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl",
        shimmer ? "skeleton-shimmer" : "animate-pulse bg-elevated/40",
        className
      )}
      {...props}
    />
  );
};
