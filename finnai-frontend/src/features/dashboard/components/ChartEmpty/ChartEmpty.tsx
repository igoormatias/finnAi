import { EmptyState } from "@/components/states";

export const ChartEmpty = ({ title = "Sem dados no período" }: { title?: string }) => {
  return <EmptyState title={title} className="min-h-[220px]" />;
}
