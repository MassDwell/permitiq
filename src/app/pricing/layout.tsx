import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MeritLayer | AI Permit & Compliance Intelligence",
  description:
    "Simple, transparent pricing for MeritLayer. Solo, Developer, and Portfolio plans for Massachusetts real estate developers. 14-day free trial. Cancel anytime.",
  openGraph: {
    title: "MeritLayer Pricing — AI Permit & Compliance Intelligence",
    description:
      "Solo at $49/mo, Developer at $99/mo, Portfolio at $199/mo. Founding member pricing locked in forever.",
    url: "https://meritlayer.ai/pricing",
    siteName: "MeritLayer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeritLayer Pricing",
    description:
      "AI-powered permit compliance for Massachusetts developers. Founding member pricing available.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
