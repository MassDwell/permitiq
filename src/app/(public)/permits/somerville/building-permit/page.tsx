import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  FileText,
  Phone,
  MapPin,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Somerville Building Permit Guide 2026 | ISD Requirements & SomerVision Zoning | MeritLayer",
  description:
    "Complete Somerville ISD building permit guide: 2–4 week timeline, SomerVision 2022 zoning, required documents, fees, and tips for developers. One of Greater Boston's most efficient permitting departments.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Somerville ISD requires plans in PDF format for online submission. Include site plan, floor plans, elevations, and sections. Two copies required for in-person submissions.",
    critical: true,
  },
  {
    name: "Structural Calculations (PE-Stamped)",
    detail: "Required for all structural work — new construction, additions, and modifications to load-bearing elements. Must be stamped by a Massachusetts-licensed Professional Engineer.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "Massachusetts Energy Code compliance (REScheck for residential, COMcheck for commercial). Somerville enforces the Stretch Energy Code for most new construction — confirm at intake.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Current recorded deed. Contractors must include a property owner authorization letter.",
    critical: false,
  },
  {
    name: "Survey / Plot Plan",
    detail: "Certified plot plan or survey showing property lines, setbacks, and proposed work. Required for new construction by a licensed land surveyor.",
    critical: false,
  },
  {
    name: "Contractor Credentials",
    detail: "Massachusetts CSL for structural work. HIC license for residential renovations over $1,000. Certificate of liability insurance naming the City of Somerville as additional insured.",
    critical: true,
  },
  {
    name: "Zoning Board Approval (if required)",
    detail: "Under SomerVision 2022 zoning, many projects that previously required variances are now by-right. Confirm your project's status before assuming a ZBA filing is needed.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "SomerVision Zoning Check",
    detail: "Verify compliance with Somerville's updated SomerVision zoning (adopted 2022). The new zoning significantly expanded by-right development allowances, especially for mixed-use and multi-family projects near transit. Use Somerville's online zoning map at somervillema.gov to check your district.",
    timeline: "1–2 days",
  },
  {
    step: 2,
    name: "Prepare Application Package",
    detail: "Coordinate all required documents. Somerville ISD accepts online submissions via the Somerville Permits portal — prepare PDF versions of all drawings. Ensure REScheck/COMcheck matches the architectural plans.",
    timeline: "Varies",
  },
  {
    step: 3,
    name: "Submit to Somerville ISD",
    detail: "Submit online at somervillema.gov/departments/isd or in person at 93 Highland Ave. Somerville ISD is known for its responsive permitting staff. For straightforward residential projects, over-the-counter approvals are sometimes available.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Plan Review",
    detail: "Somerville ISD reviews for Massachusetts State Building Code (9th Edition), energy code, and zoning compliance. Residential projects typically take 2–3 weeks; commercial projects 3–4 weeks. Somerville has invested in staffing to maintain one of Greater Boston's fastest permit review timelines.",
    timeline: "2–4 weeks typical",
  },
  {
    step: 5,
    name: "Permit Issuance",
    detail: "Once approved, pay the full permit fee and pick up or download your permit. Post the permit on-site. Keep approved plans on-site at all times during construction.",
    timeline: "Within 3–5 business days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Not checking SomerVision zoning updates",
    fix: "Somerville's 2022 SomerVision zoning significantly changed what's allowed by-right. Many projects that previously needed a variance no longer do — and some projects that were by-right before may now have different requirements. Always check current zoning.",
  },
  {
    issue: "Incomplete energy compliance for Stretch Code projects",
    fix: "Somerville requires the Stretch Energy Code for new construction. Standard REScheck may not cover all Stretch requirements. Confirm the applicable code version with ISD at intake and ensure your energy consultant is familiar with Massachusetts Stretch Code.",
  },
  {
    issue: "Plans inconsistent between disciplines",
    fix: "Somerville ISD commonly issues correction notices when architectural and structural drawings are not coordinated. Have all stamped disciplines reviewed together before submission.",
  },
  {
    issue: "Missing contractor insurance or expired licenses",
    fix: "Verify all licenses are active on OCABR before filing. Somerville ISD checks license status at submission — expired licenses result in immediate rejection.",
  },
];

const PRO_TIPS = [
  "Somerville ISD is regarded as one of Greater Boston's most efficient permitting departments — straightforward residential projects are sometimes approved in 1–2 weeks.",
  "Somerville's SomerVision 2022 zoning dramatically expanded transit-oriented development allowances near the Green Line Extension stations (GLX). Check your district — you may have more by-right development rights than you think.",
  "For projects near the Somerville/Cambridge or Somerville/Boston border, double-check jurisdiction — the city boundary runs through several blocks and can be confusing.",
  "Somerville accepts digital permit submissions for most project types. Prepare high-quality PDFs to avoid back-and-forth.",
  "Trade permits in Somerville are separate from the building permit and can be filed concurrently. Don't wait for the building permit to be issued before filing trade permits.",
  "Somerville has an active Zoning Board of Appeals (ZBA) that meets monthly — if you do need a variance, schedule early and engage neighbors proactively.",
];

export default function SomervilleBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Somerville</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Somerville ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Somerville Building Permit Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The Somerville Inspectional Services Department (ISD) issues building permits for all
          construction, renovation, and demolition work in Somerville. With updated SomerVision 2022
          zoning and a reputation for efficient permitting, here&apos;s what developers need to know.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            <Zap className="h-3.5 w-3.5" />
            2–4 weeks typical (one of Greater Boston&apos;s fastest)
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            93 Highland Ave, Somerville
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5" />
            SomerVision 2022 zoning
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Somerville ISD — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Permit Counter",
              address: "93 Highland Ave, Somerville",
              detail: "Mon–Fri 8 AM–4 PM",
              phone: "617-625-6600 x2400",
            },
            {
              label: "Online Portal",
              address: "somervillema.gov/departments/isd",
              detail: "Online applications, permit status, fee payment",
              phone: null,
            },
            {
              label: "Zoning / Planning",
              address: "Somerville Office of Strategic Planning",
              detail: "SomerVision zoning questions and pre-application consults",
              phone: "617-625-6600 x2536",
            },
          ].map((c) => (
            <div key={c.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
              <p className="font-semibold text-gray-900 text-sm">{c.address}</p>
              <p className="text-sm text-gray-600 mt-0.5">{c.detail}</p>
              {c.phone && (
                <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Fee Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fee Schedule</h2>
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Construction Cost</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Permit Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Up to $1,000", "$25 minimum"],
                ["$1,001 – $10,000", "$25 + $5 per $1,000 over $1,000"],
                ["$10,001 – $100,000", "$70 + $7 per $1,000 over $10,000"],
                ["Over $100,000", "$700 + $6 per $1,000 over $100,000"],
              ].map(([cost, fee]) => (
                <tr key={cost}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{cost}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          Fee schedule simplified for illustration. Confirm current fees with Somerville ISD at time of application. Trade permits are billed separately.
        </p>
      </section>

      {/* Required Documents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Documents</h2>
        <div className="space-y-3">
          {REQUIRED_DOCS.map((doc) => (
            <div
              key={doc.name}
              className={`border rounded-xl p-5 ${doc.critical ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`h-5 w-5 mt-0.5 flex-shrink-0 ${doc.critical ? "text-blue-600" : "text-gray-400"}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{doc.name}</p>
                    {doc.critical && (
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{doc.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Step-by-Step Process</h2>
        <div className="space-y-4">
          {PROCESS_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {step.step}
              </div>
              <div className="flex-1 pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <p className="font-semibold text-gray-900">{step.name}</p>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full flex-shrink-0">
                    {step.timeline}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Rejections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Rejections &amp; How to Avoid Them</h2>
        <div className="space-y-3">
          {COMMON_REJECTIONS.map((r) => (
            <div key={r.issue} className="border border-orange-200 bg-orange-50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{r.issue}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong className="text-green-700">Fix: </strong>{r.fix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips for Somerville Developers</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
          {PRO_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/permits/cambridge/building-permit", label: "Cambridge Building Permit", desc: "ISD requirements and LEED/green building rules" },
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements for projects in Boston" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit", desc: "By-right ADUs under the MBTA Communities Act" },
            { href: "/permits/brookline/building-permit", label: "Brookline Building Permit", desc: "Town of Brookline Building Department requirements" },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">{g.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 rounded-2xl p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Track Your Somerville Permit in MeritLayer
          </h2>
          <p className="text-blue-100 mb-6">
            Upload your Somerville permit application, track ISD review milestones, and get
            automated alerts at every stage — across all your Greater Boston projects.
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
  );
}
