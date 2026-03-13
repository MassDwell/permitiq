import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  ChevronRight,
  Scale,
  Building2,
  Home,
  FileText,
  Calculator,
  Zap,
  Wrench,
  Wind,
  Globe,
} from "lucide-react";
import { PERMIT_GUIDE_ROUTES, jurisdictionLabel, permitTypeLabel, getJurisdiction } from "@/lib/permit-rules";

export const metadata: Metadata = {
  title: "Massachusetts Permit Guides | MeritLayer",
  description:
    "Free permit requirement guides for Boston developers: ZBA variance process, Article 80 review, ADU permits, and more. Fee schedules, hearing schedules, and department contacts for Boston, Cambridge, Brookline, Somerville, Salem, Lowell, and Springfield.",
};

// Developer-specific guides (new pages)
const DEVELOPER_GUIDES = [
  {
    href: "/permits/boston/zba-variance",
    title: "Boston ZBA Variance Guide",
    description: "2026 hearing schedule, $150 filing fees, 5-step process & 45-day window",
    badge: "2026 Schedule",
    icon: Scale,
    badgeColor: "blue",
  },
  {
    href: "/permits/boston/article-80-review",
    title: "Boston Article 80 Review",
    description: "Large (≥50k sq ft) and Small (≥20k sq ft) review — LOI → PNF → Adequacy",
    badge: "July 2025 Update",
    icon: Building2,
    badgeColor: "green",
  },
  {
    href: "/permits/boston/building-permit",
    title: "Boston Building Permit Guide",
    description: "ISD requirements, stamped plans, energy compliance, fee schedule, 4–8 week review",
    badge: "ISD Guide",
    icon: FileText,
    badgeColor: "blue",
  },
  {
    href: "/permits/boston/article-85-demolition",
    title: "Article 85 Demolition Delay",
    description: "18-month delay for structures 50+ years old — triggers, exemptions, BPDA process",
    badge: "Demolition",
    icon: Building2,
    badgeColor: "orange",
  },
  {
    href: "/permits/boston/certificate-of-occupancy",
    title: "Certificate of Occupancy Guide",
    description: "Final inspection sequence, sign-offs, Temporary CO vs. permanent CO, common delays",
    badge: "CO Guide",
    icon: Home,
    badgeColor: "green",
  },
  {
    href: "/permits/massachusetts/adu-permit",
    title: "Massachusetts ADU Permit Guide",
    description: "By-right ADUs post-MBTA Act, Boston rules since 2020, fees & timeline",
    badge: "MBTA Communities Act",
    icon: Home,
    badgeColor: "purple",
  },
];

// Group standard routes by jurisdiction
const routesByJurisdiction = PERMIT_GUIDE_ROUTES.reduce<
  Record<string, typeof PERMIT_GUIDE_ROUTES>
>((acc, route) => {
  if (!acc[route.jurisdiction]) acc[route.jurisdiction] = [];
  acc[route.jurisdiction].push(route);
  return acc;
}, {});

// Permit type guides (by trade)
const TRADE_GUIDES = [
  { icon: Zap, label: "Electrical Permit", href: null },
  { icon: Wrench, label: "Plumbing Permit", href: null },
  { icon: Wind, label: "HVAC / Mechanical Permit", href: null },
  { icon: FileText, label: "Building Permit (MA)", href: "/permits/massachusetts/building-permit" },
];

const badgeStyles: Record<string, { background: string; color: string }> = {
  blue: { background: 'rgba(20,184,166,0.12)', color: '#14B8A6' },
  green: { background: 'rgba(34,197,94,0.12)', color: '#4ADE80' },
  purple: { background: 'rgba(168,85,247,0.12)', color: '#C084FC' },
  orange: { background: 'rgba(245,158,11,0.12)', color: '#FCD34D' },
};

export default function PermitsIndexPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ background: '#080D1A', minHeight: '100vh' }}>
      <div className="mb-12">
        <p className="text-sm font-medium mb-2" style={{ color: '#14B8A6' }}>Free Permit Guides</p>
        <h1 className="text-4xl font-bold text-white mb-4">
          Massachusetts Permit Requirements
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: '#94A3B8' }}>
          Detailed permit checklists, fee schedules, and department contacts for every major
          Massachusetts city — sourced directly from official building departments.
        </p>
      </div>

      {/* Zoning Lookup promo */}
      <div className="mb-6 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0f2027 0%, #0d2233 50%, #0f2638 100%)', border: '1px solid rgba(20,184,166,0.25)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#14B8A6' }} />
            <div>
              <p className="font-bold text-lg">Boston Zoning Intelligence — New</p>
              <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                Enter any Boston address → instant zoning district, FAR limits, height, setbacks, ADU eligibility, and permit requirements.
              </p>
            </div>
          </div>
          <Link
            href="/tools/zoning-lookup"
            className="font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap flex-shrink-0 text-sm"
            style={{ background: '#14B8A6', color: '#080D1A' }}
          >
            Try Zoning Lookup →
          </Link>
        </div>
      </div>

      {/* ADU Eligibility promo */}
      <div className="mb-6 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #042f2e 0%, #0d3b38 50%, #042f2e 100%)', border: '1px solid rgba(20,184,166,0.35)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Home className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#14B8A6' }} />
            <div>
              <p className="font-bold text-lg">ADU (Accessory Dwelling Units) — 2024 MA Law</p>
              <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                Massachusetts&apos; 2024 ADU law changed everything. Every single-family and two-family home now has
                by-right ADU access — no ZBA, no special permit. Here&apos;s what you need to know.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Link
              href="/tools/adu-eligibility"
              className="font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap text-sm text-center"
              style={{ background: '#14B8A6', color: '#080D1A' }}
            >
              Check Your Eligibility →
            </Link>
            <Link
              href="/permits/boston/adu-permit"
              className="font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap text-sm text-center"
              style={{ background: 'rgba(20,184,166,0.12)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}
            >
              ADU Permit Guide →
            </Link>
          </div>
        </div>
      </div>

      {/* Soft Costs Calculator promo */}
      <div className="mb-12 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.06) 100%)', border: '1px solid rgba(20,184,166,0.25)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#14B8A6' }} />
            <div>
              <p className="font-bold text-lg">Soft Costs Calculator — New</p>
              <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                Estimate permit fees, ZBA costs, trade permits, and carrying costs for any Greater
                Boston project. City-specific fee schedules built in.
              </p>
            </div>
          </div>
          <Link
            href="/tools/soft-costs-calculator"
            className="font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap flex-shrink-0 text-sm"
            style={{ background: '#14B8A6', color: '#080D1A' }}
          >
            Open Calculator →
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* Boston Developer Guides */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 flex-shrink-0" style={{ color: '#14B8A6' }} />
            <h2 className="text-lg font-semibold text-white">Boston Developer Guides</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(20,184,166,0.12)', color: '#14B8A6' }}>New</span>
          </div>
          <div className="grid sm:grid-cols-1 gap-3">
            {DEVELOPER_GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="flex items-center justify-between p-5 rounded-xl transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(20,184,166,0.10)' }}>
                      <Icon className="h-5 w-5" style={{ color: '#14B8A6' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white group-hover:text-[#14B8A6] transition-colors">
                          {guide.title}
                        </p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyles[guide.badgeColor]}>
                          {guide.badge}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{guide.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors flex-shrink-0 ml-3" style={{ color: '#475569' }} />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Greater Boston City Cards */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 flex-shrink-0" style={{ color: '#14B8A6' }} />
            <h2 className="text-lg font-semibold text-white">Greater Boston</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: '#64748B' }}>
            City-specific permit intelligence — not generic national guides
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                city: "Boston",
                desc: "ISD · ZBA · Article 80",
                href: "/permits/boston/building-permit",
                available: true,
              },
              {
                city: "Cambridge",
                desc: "ISD · BZA · LEED",
                href: "/permits/cambridge/building-permit",
                available: true,
              },
              {
                city: "Somerville",
                desc: "ISD · SomerVision 2022",
                href: "/permits/somerville/building-permit",
                available: true,
              },
              {
                city: "Brookline",
                desc: "Town Building Dept · Historical",
                href: "/permits/brookline/building-permit",
                available: true,
              },
              {
                city: "Newton",
                desc: "Building Dept",
                href: null,
                available: false,
              },
            ].map((item) =>
              item.available && item.href ? (
                <Link
                  key={item.city}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group text-center"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
                >
                  <p className="font-semibold text-white group-hover:text-[#14B8A6] transition-colors text-sm">
                    {item.city}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{item.desc}</p>
                </Link>
              ) : (
                <div
                  key={item.city}
                  className="flex flex-col items-center justify-center p-4 rounded-xl opacity-40 text-center cursor-default"
                  style={{ border: '1px solid rgba(255,255,255,0.04)', background: '#0D1525' }}
                >
                  <p className="font-semibold text-sm" style={{ color: '#64748B' }}>{item.city}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Coming soon</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* By City */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: '#14B8A6' }} />
            <h2 className="text-lg font-semibold text-white">By City — Building &amp; Demo Permits</h2>
          </div>
          <div className="space-y-8">
            {Object.entries(routesByJurisdiction).map(([jurisdiction, routes]) => {
              const j = jurisdiction !== "massachusetts" ? getJurisdiction(jurisdiction) : null;
              return (
                <div key={jurisdiction}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h3 className="font-medium text-sm" style={{ color: '#94A3B8' }}>
                      {jurisdictionLabel(jurisdiction)}
                    </h3>
                    {j?.department && (
                      <span className="text-xs" style={{ color: '#475569' }}>— {j.department}</span>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {routes.map((route) => (
                      <Link
                        key={`${route.jurisdiction}-${route.permitType}`}
                        href={`/permits/${route.jurisdiction}/${route.permitType}`}
                        className="flex items-center justify-between p-4 rounded-xl transition-all group"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
                      >
                        <div>
                          <p className="font-medium text-white group-hover:text-[#14B8A6] transition-colors">
                            {jurisdictionLabel(jurisdiction)} {permitTypeLabel(route.permitType)}
                          </p>
                          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
                            Requirements, fees &amp; contacts
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors flex-shrink-0" style={{ color: '#475569' }} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* By Permit Type */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: '#14B8A6' }} />
            <h2 className="text-lg font-semibold text-white">By Permit Type</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Developer guides repeated for context */}
            <Link
              href="/permits/boston/zba-variance"
              className="flex items-center gap-3 p-4 rounded-xl transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
            >
              <Scale className="h-5 w-5 group-hover:text-[#14B8A6] transition-colors flex-shrink-0" style={{ color: '#475569' }} />
              <div>
                <p className="font-medium text-white group-hover:text-[#14B8A6] transition-colors text-sm">ZBA Variance / Special Permit</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Boston — 2026 hearing schedule</p>
              </div>
            </Link>
            <Link
              href="/permits/boston/article-80-review"
              className="flex items-center gap-3 p-4 rounded-xl transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
            >
              <Building2 className="h-5 w-5 group-hover:text-[#14B8A6] transition-colors flex-shrink-0" style={{ color: '#475569' }} />
              <div>
                <p className="font-medium text-white group-hover:text-[#14B8A6] transition-colors text-sm">Large / Small Project Review</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Boston Article 80 — ≥20,000 sq ft</p>
              </div>
            </Link>
            <Link
              href="/permits/massachusetts/adu-permit"
              className="flex items-center gap-3 p-4 rounded-xl transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
            >
              <Home className="h-5 w-5 group-hover:text-[#14B8A6] transition-colors flex-shrink-0" style={{ color: '#475569' }} />
              <div>
                <p className="font-medium text-white group-hover:text-[#14B8A6] transition-colors text-sm">ADU Permit</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Massachusetts — MBTA Communities Act</p>
              </div>
            </Link>
            {TRADE_GUIDES.map((g) => {
              const Icon = g.icon;
              return g.href ? (
                <Link
                  key={g.label}
                  href={g.href}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
                >
                  <Icon className="h-5 w-5 group-hover:text-[#14B8A6] flex-shrink-0" style={{ color: '#475569' }} />
                  <p className="font-medium text-white group-hover:text-[#14B8A6] text-sm">{g.label}</p>
                </Link>
              ) : (
                <div
                  key={g.label}
                  className="flex items-center gap-3 p-4 rounded-xl opacity-40 cursor-default"
                  style={{ border: '1px solid rgba(255,255,255,0.04)', background: '#0D1525' }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" style={{ color: '#475569' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#64748B' }}>{g.label}</p>
                    <p className="text-xs" style={{ color: '#475569' }}>Guide coming soon</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)', border: '1px solid rgba(20,184,166,0.25)' }}>
        <h2 className="text-2xl font-bold text-white mb-2">
          Managing multiple projects?
        </h2>
        <p className="mb-6" style={{ color: '#94A3B8' }}>
          MeritLayer tracks permit requirements, deadlines, and compliance across all your
          Massachusetts projects — with AI-powered document processing and proactive alerts.
        </p>
        <Link
          href="/sign-up"
          className="inline-block font-semibold px-6 py-3 rounded-xl transition-colors"
          style={{ background: '#14B8A6', color: '#080D1A' }}
        >
          Start Free Trial
        </Link>
      </div>
    </main>
  );
}
