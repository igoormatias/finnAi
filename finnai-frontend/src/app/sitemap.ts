import type { MetadataRoute } from "next";

import { getAppUrl } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/workspaces`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
}
