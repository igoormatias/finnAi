import { Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";

export const GoalsSkeleton = () => (
  <PageContainer aria-busy="true" aria-label="Carregando metas">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-72" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  </PageContainer>
);
