import { EmptyState } from "@/components/states/empty-state";

export function ChartEmpty({ title = "Sem dados no período" }: { title?: string }) {
  return <EmptyState title={title} className="min-h-[220px]" />;
}
