import { Card, CardContent, CardHeader } from "@/components/ui";
import { Skeleton } from "@/components/ui";

export const AIScoreSkeleton = () => {
  return (
    <section className="grid gap-6 p-4 md:p-6" aria-busy="true" aria-label="Carregando FinnAI Score">
      <div className="grid gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 lg:flex-row lg:py-8">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="grid w-full max-w-lg gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
