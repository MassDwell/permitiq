"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Check, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/ui/logo";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SPOTS_REMAINING = 47;
const SPOTS_TOTAL = 50;
const DEADLINE = "April 15, 2026";

const TIERS = [
  {
    id: "solo",
    name: "Solo",
    founderPrice: 49,
    regularPrice: 149,
    founderPriceId: "price_1TAKUV8WeSNkRrKoSn83vPyr",
    regularPriceId: "price_1TAIiZ94ePmNThnD8A8bjdVn",
    description: "For independent contractors and solo operators.",
    popular: false,
    features: [
      "Up to 3 active projects",
      "AI document extraction",
      "Compliance checklist tracking",
      "Permit workflow tracker",
      "Public permit guides",
      "Soft costs calculator",
      "Email support",
    ],
  },
  {
    id: "developer",
    name: "Developer",
    founderPrice: 99,
    regularPrice: 349,
    founderPriceId: "price_1TAKUW8WeSNkRrKo864hCugD",
    regularPriceId: "price_1TAIia94ePmNThnD1mr2KDJT",
    description: "For development teams managing multiple projects.",
    popular: true,
    features: [
      "Everything in Solo",
      "Up to 10 active projects",
      "3 team members",
      "AI permit research with source citations",
      "Inspection tracker (14-step Boston sequence)",
      "Comment response assistant",
      "AHJ contact directory",
      "Priority email support",
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    founderPrice: 199,
    regularPrice: 749,
    founderPriceId: "price_1TAKUX8WeSNkRrKoG6rVbNmn",
    regularPriceId: "price_1TAIib94ePmNThnDBfqopr9e",
    description: "For firms managing large project portfolios.",
    popular: false,
    features: [
      "Everything in Developer",
      "Unlimited projects",
      "Unlimited team members",
      "API access",
      "White-label option",
      "Custom AHJ integrations",
      "Dedicated onboarding call",
      "Phone + email support",
    ],
  },
];

const FAQS = [
  {
    q: "What is Founding Member pricing?",
    a: "Founding Member pricing locks in a significantly discounted rate for early supporters of MeritLayer. You pay the founder price for as long as you remain a subscriber — when regular pricing launches at higher rates, your price never changes.",
  },
  {
    q: "How long is the founding member offer available?",
    a: `The offer expires on ${DEADLINE} or when all ${SPOTS_TOTAL} founding member spots are claimed — whichever comes first. Once the spots are gone, pricing reverts to regular rates.`,
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can upgrade or downgrade at any time from your account settings. If you upgrade while on a founder plan, your new plan will also lock in at the founder rate for that tier.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every new account gets a 14-day free trial. No credit card required to start. Your founding member discount is applied when you subscribe at the end of your trial.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. All payments are processed securely and receipts are sent automatically.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts. Cancel anytime from your account settings and you won't be charged again.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function savingsPercent(founder: number, regular: number) {
  return Math.round(((regular - founder) / regular) * 100);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SpotsBar() {
  const used = SPOTS_TOTAL - SPOTS_REMAINING;
  const pct = (used / SPOTS_TOTAL) * 100;
  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "#94A3B8" }}>
        <span>{SPOTS_REMAINING} of {SPOTS_TOTAL} spots remaining</span>
        <span>{used} claimed</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #14B8A6, #0EA5E9)",
          }}
        />
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  isAnnual,
  onCheckout,
  loading,
}: {
  tier: typeof TIERS[0];
  isAnnual: boolean;
  onCheckout: (priceId: string) => void;
  loading: boolean;
}) {
  const founder = isAnnual ? Math.round(tier.founderPrice * 0.833) : tier.founderPrice;
  const regular = isAnnual ? Math.round(tier.regularPrice * 0.833) : tier.regularPrice;
  const savings = savingsPercent(tier.founderPrice, tier.regularPrice);

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: tier.popular ? "linear-gradient(160deg, #0D1A2E 0%, #0D1526 100%)" : "#0D1526",
        border: tier.popular ? "1px solid rgba(20,184,166,0.5)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: tier.popular ? "0 0 40px rgba(20,184,166,0.12), inset 0 1px 0 rgba(20,184,166,0.15)" : "none",
      }}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <span
            className="text-xs font-semibold px-4 py-1 rounded-b-lg"
            style={{ background: "#14B8A6", color: "#fff", letterSpacing: "0.05em" }}
          >
            MOST POPULAR
          </span>
        </div>
      )}

      <div className={`flex-1 flex flex-col p-7 ${tier.popular ? "pt-10" : ""}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold" style={{ color: "#F1F5F9" }}>
              {tier.name}
            </h3>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(20,184,166,0.15)",
                color: "#14B8A6",
                border: "1px solid rgba(20,184,166,0.3)",
              }}
            >
              SAVE {savings}%
            </span>
          </div>
          <p className="text-sm" style={{ color: "#64748B" }}>
            {tier.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-extrabold tracking-tight" style={{ color: "#14B8A6" }}>
              ${founder}
            </span>
            <span className="text-sm pb-2" style={{ color: "#64748B" }}>
              /mo{isAnnual ? " (billed annually)" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm line-through" style={{ color: "#475569" }}>
              ${regular}/mo regular
            </span>
            <span className="text-xs font-semibold" style={{ color: "#EF4444" }}>
              ↑ after founding offer ends
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onCheckout(tier.founderPriceId)}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 mb-7"
          style={
            tier.popular
              ? {
                  background: loading ? "rgba(20,184,166,0.5)" : "#14B8A6",
                  color: "#fff",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(20,184,166,0.35)",
                }
              : {
                  background: "transparent",
                  color: "#14B8A6",
                  border: "1px solid rgba(20,184,166,0.4)",
                }
          }
        >
          {loading ? "Redirecting..." : "Get Founding Member Access"}
        </button>

        {/* Features */}
        <ul className="space-y-3">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#14B8A6" }} />
              <span className="text-sm" style={{ color: "#94A3B8" }}>
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#0D1526" }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm" style={{ color: "#F1F5F9" }}>
          {q}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "#64748B" }} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "#64748B" }} />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  async function handleCheckout(priceId: string, tierId: string) {
    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoadingTier(null);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setLoadingTier(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#080D1A", color: "#F1F5F9", fontFamily: "var(--font-jakarta, sans-serif)" }}>

      {/* ------------------------------------------------------------------ */}
      {/* Nav */}
      {/* ------------------------------------------------------------------ */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: "rgba(8,13,26,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ color: "#94A3B8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ color: "#94A3B8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Urgency banner */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="text-center py-2.5 text-sm font-medium"
        style={{
          background: "linear-gradient(90deg, rgba(20,184,166,0.15), rgba(14,165,233,0.15))",
          borderBottom: "1px solid rgba(20,184,166,0.2)",
          color: "#14B8A6",
        }}
      >
        <Zap className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
        Founding Member offer — only {SPOTS_REMAINING} spots left · Expires {DEADLINE}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          style={{
            background: "rgba(20,184,166,0.1)",
            border: "1px solid rgba(20,184,166,0.25)",
            color: "#14B8A6",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
          FOUNDING MEMBER PRICING
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4" style={{ color: "#F1F5F9", lineHeight: 1.1 }}>
          Lock in your rate before <br className="hidden sm:block" />
          <span style={{ color: "#14B8A6" }}>prices go up permanently</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: "#64748B" }}>
          First {SPOTS_TOTAL} members lock in founder pricing forever. After that,
          regular pricing applies — no exceptions.
        </p>

        <SpotsBar />

        {/* AUDIT-FIX: Annual toggle hidden — annual Stripe prices not yet created; would mislead customers */}
        {/* Annual toggle disabled until annual price IDs are configured in Stripe */}
        <div className="flex items-center justify-center gap-3 mt-10" style={{ display: 'none' }}>
          <span className="text-sm font-medium" style={{ color: isAnnual ? "#475569" : "#F1F5F9" }}>
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ background: isAnnual ? "#14B8A6" : "rgba(255,255,255,0.12)" }}
          >
            <span
              className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: isAnnual ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
          <span className="text-sm font-medium" style={{ color: isAnnual ? "#F1F5F9" : "#475569" }}>
            Annual
            <span
              className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(20,184,166,0.15)", color: "#14B8A6" }}
            >
              2 months free
            </span>
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pricing cards */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isAnnual={isAnnual}
              onCheckout={(priceId) => handleCheckout(priceId, tier.id)}
              loading={loadingTier === tier.id}
            />
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-xs mt-6" style={{ color: "#334155" }}>
          No credit card required for 14-day trial · Cancel anytime · Secure checkout via Stripe
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What you get section */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.15)" }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: "#F1F5F9" }}>
            Why become a Founding Member?
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748B" }}>
            You&apos;re betting on us early — we reward that with permanent savings.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: "Price locked forever", desc: "Your founder rate never increases, even as we add features." },
              { label: "Early feature access", desc: "Founding members get new features before public release." },
              { label: "Founding member badge", desc: "Recognized permanently in your account as a founder." },
            ].map(({ label, desc }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Check className="h-4 w-4" style={{ color: "#14B8A6" }} />
                  <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                    {label}
                  </span>
                </div>
                <p className="text-xs pl-6" style={{ color: "#475569" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-2xl mx-auto px-5 pb-24">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#F1F5F9" }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom CTA */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="text-center py-16 px-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#F1F5F9" }}>
          {SPOTS_REMAINING} founding spots left
        </h2>
        <p className="text-sm mb-6" style={{ color: "#64748B" }}>
          Offer expires {DEADLINE}. After that, regular pricing applies.
        </p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#14B8A6", color: "#fff", boxShadow: "0 4px 14px rgba(20,184,166,0.35)" }}
        >
          <Zap className="h-4 w-4" />
          Claim your founding spot
        </a>
      </section>

      {/* Footer */}
      <footer
        className="text-center py-8 text-xs"
        style={{ color: "#334155", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        © {new Date().getFullYear()} MeritLayer · AI-Powered Construction Compliance
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#080D1A" }}>
          <div style={{ color: "#475569" }}>Loading...</div>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
