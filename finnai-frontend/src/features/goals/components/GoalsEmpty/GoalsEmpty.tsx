import { Target } from "lucide-react";

import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui";

export const GoalsEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <EmptyState
    icon={Target}
    title="Nenhuma meta ainda"
    description="Defina objetivos financeiros e acompanhe seu progresso com clareza."
    action={
      <Button type="button" onClick={onCreate} className="cursor-pointer">
        Criar primeira meta
      </Button>
    }
    className="min-h-[280px]"
  />
);
