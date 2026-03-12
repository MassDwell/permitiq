import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  DollarSign,
  FileText,
  MapPin,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Massachusetts ADU Permit Guide 2026 | By-Right ADUs, Fees & Timeline | MeritLayer",
  description:
    "Complete Massachusetts ADU permit guide: MBTA Communities Act by-right ADU rules, Boston ADU program since 2020, Salem $15/$1,000 fee schedule, 8–16 week permit timeline, and factory-built ADU options.",
};

const PERMIT_REQUIREMENTS = [
  {
    category: "Building Permit",
    items: [
      "Completed building permit application with project valuation",
      "Architectural plans (floor plan, elevations, site plan)",
      "Structural drawings if adding load-bearing elements",
      "Energy code compliance documentation (REScheck or COMcheck)",
      "Zoning compliance confirmation (setbacks, lot coverage, height)",
      "Construction Supervisor License (CSL) number",
      "Workers Compensation insurance certificate",
    ],
  },
  {
    category: "Trade Permits (each separate)",
    items: [
      "Electrical permit — filed by licensed electrician",
      "Plumbing permit — filed by licensed plumber",
      "Gas permit (if gas service) — filed by licensed plumber",
      "Mechanical/HVAC permit (if new HVAC system)",
    ],
  },
  {
    category: "Zoning & Approvals",
    items: [
      "Confirm by-right eligibility (most MA communities near T now must allow ADUs by-right)",
      "Verify setback, lot coverage, and height requirements with local zoning office",
      "Historic district review (if applicable)",
      "Confirm owner-occupancy requirement status in your municipality",
    ],
  },
];

const CITY_ADU_RULES = [
  {
    city: "Boston",
    status: "By-Right Since 2020",
    color: "green",
    detail:
      "Boston allows ADUs by-right in all neighborhoods since 2020. No ZBA approval required for qualifying ADUs. Owner-occupancy required (one unit must be owner-occupied). ISD reviews building permit only.",
    fee: "$50 per $1,000 (residential rate)",
  },
  {
    city: "Cambridge",
    status: "By-Right (MBTA)",
    color: "green",
    detail:
      "Cambridge is an MBTA community. ADUs allowed by-right per the 2024 state mandate. Building permit through Cambridge ISD at $20/$1,000.",
    fee: "$20 per $1,000",
  },
  {
    city: "Brookline",
    status: "By-Right (MBTA)",
    color: "green",
    detail:
      "Brookline is an MBTA community required to allow ADUs by-right. Building permit at $20/$1,000 minimum $50.",
    fee: "$20 per $1,000 (min $50)",
  },
  {
    city: "Salem",
    status: "By-Right (MBTA)",
    color: "green",
    detail:
      "Salem allows ADUs in residential zones. Fee schedule is $15/$1,000 for ADUs (same as residential new work). Historic district properties may need additional review.",
    fee: "$15 per $1,000 (ADU rate)",
  },
  {
    city: "Somerville",
    status: "By-Right (MBTA)",
    color: "green",
    detail:
      "Somerville is an MBTA community. ADUs must be allowed by-right. Apply through CitizenServe portal.",
    fee: "Per fee schedule",
  },
  {
    city: "Lowell",
    status: "By-Right (MBTA)",
    color: "green",
    detail:
      "Lowell is an MBTA community. ADUs allowed by-right in residential zones. $50 base fee + $10/$1,000 above $1,000.",
    fee: "$50 base + $10/$1,000",
  },
];

const TIMELINE_PHASES = [
  { phase: "Zoning Confirmation", weeks: "1–2", detail: "Confirm by-right eligibility, setbacks, and lot requirements" },
  { phase: "Plans & Documents", weeks: "2–4", detail: "Architect drawings, energy compliance, contractor licensing" },
  { phase: "Permit Application", weeks: "1–2", detail: "Submit online or in person; pay permit fee" },
  { phase: "Plan Review", weeks: "3–6", detail: "City building department reviews for code compliance" },
  { phase: "Permit Issuance", weeks: "1", detail: "Permit issued; post on-site before starting work" },
  { phase: "Construction", weeks: "8–16", detail: "Faster for factory-built/modular ADUs (4–8 weeks on site)" },
  { phase: "Inspections & CO", weeks: "2–4", detail: "Framing, trade, and final inspections; Certificate of Occupancy" },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Get an ADU Permit in Massachusetts",
  description:
    "Step-by-step guide to obtaining an Accessory Dwelling Unit (ADU) permit in Massachusetts, including MBTA Communities Act by-right rules.",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    minValue: "500",
    maxValue: "5000",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Confirm By-Right Eligibility",
      text: "Verify your municipality allows ADUs by-right per the MBTA Communities Act or local ordinance. Most communities near T stops must allow ADUs by-right as of 2024.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Prepare Plans and Documents",
      text: "Engage a licensed architect for drawings. Prepare energy compliance documentation, contractor licenses, and insurance certificates.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Submit Building Permit Application",
      text: "Apply online or in person at your local building department. Pay permit fee based on construction cost.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Submit Trade Permits",
      text: "Separately file electrical, plumbing, gas, and mechanical permits with licensed contractors in each trade.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Pass Inspections",
      text: "Schedule and pass all required inspections: footing, framing, trade rough-ins, and final inspection.",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Receive Certificate of Occupancy",
      text: "After final inspection approval, receive Certificate of Occupancy before occupying the ADU.",
    },
  ],
};

export default function AduPermitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
          <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Massachusetts</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900">ADU Permit</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Home className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Massachusetts Permit Guide</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Massachusetts ADU Permit Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            An Accessory Dwelling Unit (ADU) is a secondary housing unit on the same lot as a
            primary residence — a basement apartment, garage apartment, or detached cottage. Since
            the MBTA Communities Act, most Massachusetts communities must allow ADUs by-right near
            transit.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" />
              By-Right in Boston since 2020
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
              <FileText className="h-3.5 w-3.5" />
              MBTA Communities Act Mandate
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              8–16 weeks post-permit
            </span>
          </div>
        </div>

        {/* MBTA Communities Act Banner */}
        <section className="mb-10">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-lg mb-2">
                  MBTA Communities Act: ADUs by Right Across Massachusetts
                </p>
                <p className="text-gray-700">
                  Under Massachusetts General Laws Chapter 40A, Section 3A (the MBTA Communities Act),
                  all communities with MBTA service or adjacency must allow Accessory Dwelling Units
                  (ADUs) <strong>by-right</strong> in residential zones near transit. This means no
                  ZBA hearing, no special permit, no neighborhood approval — just a building permit.
                </p>
                <p className="text-gray-700 mt-3">
                  As of 2024, this requirement applies to the <strong>177 MBTA communities</strong> in
                  Greater Boston and beyond. Communities that fail to comply risk losing eligibility
                  for certain state grants and funding.
                </p>
                <div className="mt-4 bg-white border border-blue-200 rounded-xl p-3 inline-block">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key Requirement</p>
                  <p className="text-sm text-gray-800 font-medium">
                    ADUs ≤900 sq ft must be allowed by-right in single-family residential districts
                    in all MBTA communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Boston ADU Program */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Boston ADU: By-Right Since 2020</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <p className="text-gray-700 mb-4">
              Boston was ahead of the state mandate — it approved ADUs by-right in all neighborhoods
              in 2020. Boston homeowners can add an ADU without ZBA approval if the project meets the
              following criteria:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                "One unit on the lot must be owner-occupied",
                "ADU must be within or attached to the main structure (basement, attic, garage conversion, or addition)",
                "ADU must comply with Boston's dimensional requirements (setbacks, height)",
                "ADU square footage is limited to the lesser of 900 sq ft or the gross floor area of the main unit",
                "Only one ADU per lot",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">
              Projects that don&apos;t meet the by-right criteria can still pursue a ZBA special permit.
              See our{" "}
              <Link href="/permits/boston/zba-variance" className="text-blue-600 hover:underline">
                ZBA Variance Guide
              </Link>{" "}
              for the appeal process.
            </p>
          </div>
        </section>

        {/* Permit Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Permit Requirements</h2>
          <div className="space-y-4">
            {PERMIT_REQUIREMENTS.map((req) => (
              <div key={req.category} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <p className="font-semibold text-gray-900">{req.category}</p>
                </div>
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {req.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fees by City */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ADU Permit Fees by City</h2>
          <p className="text-gray-600 mb-5">
            ADU permit fees are calculated as a percentage of total construction cost. Salem&apos;s
            residential ADU rate is $15 per $1,000.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {CITY_ADU_RULES.map((city) => (
              <div key={city.city} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{city.city}</p>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {city.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{city.detail}</p>
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{city.fee}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Fees are estimates. Confirm current rates with each city&apos;s building department before
            filing. Trade permits (electrical, plumbing, gas, mechanical) are billed separately.
          </p>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Typical ADU Timeline</h2>
          <p className="text-gray-600 mb-5">
            From zoning confirmation to Certificate of Occupancy, plan for{" "}
            <strong>4–8 months</strong> for a standard ADU. Factory-built (modular) ADUs can
            significantly compress on-site construction time to 4–8 weeks.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Phase</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Timeline</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIMELINE_PHASES.map((phase) => (
                  <tr key={phase.phase}>
                    <td className="px-5 py-3 font-medium text-gray-900 text-sm">{phase.phase}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        {phase.weeks} wks
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 hidden sm:table-cell">{phase.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Factory-built callout */}
          <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Factory-Built ADUs: Faster Construction</p>
                <p className="text-sm text-gray-700 mt-1">
                  Factory-built (panelized or modular) ADUs are assembled off-site and installed on your
                  foundation in weeks rather than months. The permit process is the same — you still need
                  a building permit and all trade permits — but on-site construction time is typically{" "}
                  <strong>4–8 weeks</strong> compared to 12–20 weeks for stick-built. Several
                  Massachusetts manufacturers now offer pre-designed ADU models optimized for urban lots.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 rounded-2xl p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Track Your ADU Compliance in MeritLayer
            </h2>
            <p className="text-blue-100 mb-6">
              MeritLayer tracks building permit status, trade permit milestones, inspection schedules,
              and zoning compliance for ADU projects across Greater Boston. Never miss a deadline or
              inspection window.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/permits"
                className="inline-flex items-center gap-2 bg-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors"
              >
                More Permit Guides
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
