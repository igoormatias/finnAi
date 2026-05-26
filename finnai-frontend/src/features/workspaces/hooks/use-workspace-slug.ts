"use client";

import { useParams } from "next/navigation";

export function useWorkspaceSlugOptional(): string | null {
  const params = useParams();
  const slug = params?.slug;
  return typeof slug === "string" && slug.length > 0 ? slug : null;
}

export function useWorkspaceSlug(): string {
  const slug = useWorkspaceSlugOptional();
  if (!slug) {
    throw new Error("Workspace slug is required in this route");
  }
  return slug;
}
