import { Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";

export default function AppLoading() {
  return (
    <PageContainer aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-[280px] w-full" />
    </PageContainer>
  );
}
