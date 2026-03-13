import type { MetadataRoute } from "next";
import { PERMIT_GUIDE_ROUTES } from "@/lib/permit-rules";

const BASE_URL = "https://meritlayer.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const permitGuideUrls = PERMIT_GUIDE_ROUTES.map((route) => ({
    url: `${BASE_URL}/permits/${route.jurisdiction}/${route.permitType}`,
    lastModified: new Date("2026-03-12"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const toolUrls = [
    "soft-costs-calculator",
    "adu-eligibility",
    "zoning-lookup",
  ].map((tool) => ({
    url: `${BASE_URL}/tools/${tool}`,
    lastModified: new Date("2026-03-12"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/permits`,
      lastModified: new Date("2026-03-12"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...permitGuideUrls,
    ...toolUrls,
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
