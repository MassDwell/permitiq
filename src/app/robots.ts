import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/settings",
          "/settings/",
          "/invite/",
          "/dashboard",
          "/dashboard/",
          "/projects/",
          "/alerts",
          "/portfolio",
        ],
      },
    ],
    sitemap: "https://meritlayer.ai/sitemap.xml",
  };
}
