import { redirect } from "next/navigation";

import { workspacePath } from "@/shared/config/routes";

export default async function GastosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(workspacePath(slug, "transactions"));
}
