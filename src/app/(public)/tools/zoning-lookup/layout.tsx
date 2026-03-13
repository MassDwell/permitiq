import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boston Zoning Lookup — Instant Zoning Intelligence | MeritLayer",
  description:
    "Enter any Boston address and instantly get zoning district, FAR limits, height restrictions, setbacks, ADU eligibility, and permit requirements. Free zoning intelligence tool.",
  openGraph: {
    title: "Boston Zoning Lookup — Instant Zoning Intelligence",
    description:
      "Enter any Boston address → instant zoning district, FAR limits, height, setbacks, ADU eligibility, and permit requirements.",
    url: "https://meritlayer.ai/tools/zoning-lookup",
    siteName: "MeritLayer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boston Zoning Lookup | MeritLayer",
    description:
      "Free Boston zoning intelligence — district, FAR, height, setbacks, ADU eligibility.",
  },
};

export default function ZoningLookupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
