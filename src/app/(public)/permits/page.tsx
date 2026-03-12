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

const badgeStyles: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
};

export default function PermitsIndexPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="text-sm font-medium text-blue-600 mb-2">Free Permit Guides</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Massachusetts Permit Requirements
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Detailed permit checklists, fee schedules, and department contacts for every major
          Massachusetts city — sourced directly from official building departments.
        </p>
      </div>

      {/* Soft Costs Calculator promo */}
      <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Soft Costs Calculator — New</p>
              <p className="text-blue-100 text-sm mt-0.5">
                Estimate permit fees, ZBA costs, trade permits, and carrying costs for any Greater
                Boston project. City-specific fee schedules built in.
              </p>
            </div>
          </div>
          <Link
            href="/tools/soft-costs-calculator"
            className="bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0 text-sm"
          >
            Open Calculator →
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* Boston Developer Guides */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900">Boston Developer Guides</h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">New</span>
          </div>
          <div className="grid sm:grid-cols-1 gap-3">
            {DEVELOPER_GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 group-hover:bg-white flex items-center justify-center transition-colors">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {guide.title}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[guide.badgeColor]}`}>
                          {guide.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{guide.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-3" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* By City */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900">By City — Building &amp; Demo Permits</h2>
          </div>
          <div className="space-y-8">
            {Object.entries(routesByJurisdiction).map(([jurisdiction, routes]) => {
              const j = jurisdiction !== "massachusetts" ? getJurisdiction(jurisdiction) : null;
              return (
                <div key={jurisdiction}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h3 className="font-medium text-gray-700 text-sm">
                      {jurisdictionLabel(jurisdiction)}
                    </h3>
                    {j?.department && (
                      <span className="text-xs text-gray-400">— {j.department}</span>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {routes.map((route) => (
                      <Link
                        key={`${route.jurisdiction}-${route.permitType}`}
                        href={`/permits/${route.jurisdiction}/${route.permitType}`}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                            {jurisdictionLabel(jurisdiction)} {permitTypeLabel(route.permitType)}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Requirements, fees &amp; contacts
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
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
            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900">By Permit Type</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Developer guides repeated for context */}
            <Link
              href="/permits/boston/zba-variance"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Scale className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">ZBA Variance / Special Permit</p>
                <p className="text-xs text-gray-500">Boston — 2026 hearing schedule</p>
              </div>
            </Link>
            <Link
              href="/permits/boston/article-80-review"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Building2 className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">Large / Small Project Review</p>
                <p className="text-xs text-gray-500">Boston Article 80 — ≥20,000 sq ft</p>
              </div>
            </Link>
            <Link
              href="/permits/massachusetts/adu-permit"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Home className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">ADU Permit</p>
                <p className="text-xs text-gray-500">Massachusetts — MBTA Communities Act</p>
              </div>
            </Link>
            {TRADE_GUIDES.map((g) => {
              const Icon = g.icon;
              return g.href ? (
                <Link
                  key={g.label}
                  href={g.href}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                  <p className="font-medium text-gray-900 group-hover:text-blue-700 text-sm">{g.label}</p>
                </Link>
              ) : (
                <div
                  key={g.label}
                  className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50 opacity-60 cursor-default"
                >
                  <Icon className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 text-sm">{g.label}</p>
                    <p className="text-xs text-gray-400">Guide coming soon</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Managing multiple projects?
        </h2>
        <p className="text-blue-100 mb-6">
          MeritLayer tracks permit requirements, deadlines, and compliance across all your
          Massachusetts projects — with AI-powered document processing and proactive alerts.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Start Free Trial
        </Link>
      </div>
    </main>
  );
}
