import type { MetadataRoute } from "next";

import { getAppUrl } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/workspaces/*/settings"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
