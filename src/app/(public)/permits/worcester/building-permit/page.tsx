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
} from "lucide-react";

export const metadata: Metadata = {
  title: "Worcester Building Permit Guide 2026 | Requirements & Fees | MeritLayer",
  description:
    "Complete Worcester MA building permit guide: required documents, fee schedule, 4–6 week timeline, common rejections, and pro tips for developers. Worcester Inspectional Services.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Must include site plan, floor plans, elevations, sections, and a door/window schedule. Two full-size sets required for Worcester ISD.",
    critical: true,
  },
  {
    name: "Structural Calculations",
    detail: "PE-stamped structural calculations required for new construction, additions, and any work affecting load-bearing systems, foundations, or roof structure.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "REScheck (residential) or COMcheck (commercial) energy compliance report. Must align exactly with the submitted plan set. Required for new construction and substantial renovations.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Current recorded deed. Contractors must include an authorization letter from the property owner.",
    critical: false,
  },
  {
    name: "Property Survey / Plot Plan",
    detail: "Certified survey or plot plan showing property lines, setbacks, existing structures, and proposed work. Required for new construction and additions affecting setbacks.",
    critical: false,
  },
  {
    name: "Contractor License & Insurance",
    detail: "Massachusetts HIC license for residential work over $1,000. CSL for structural work. Certificate of liability insurance naming the City of Worcester as additional insured.",
    critical: true,
  },
  {
    name: "ZBA Approval (if required)",
    detail: "If your project requires a variance or special permit, include the Worcester ZBA decision letter. Building permits cannot be issued until ZBA approval is in hand.",
    critical: false,
  },
  {
    name: "Historic District Commission Approval (if applicable)",
    detail: "Portions of Worcester's Main South, Elm Park, and other neighborhoods have historic protections. Projects in these areas may require HDC review before permit issuance.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Pre-Application Zoning Check",
    detail: "Review your project against Worcester's Zoning Ordinance. Worcester has a mix of residential, business, and industrial zones. Worcester is an MBTA Community — ADU projects qualify for by-right approval on qualifying lots. Contact the Inspectional Services Division for pre-application guidance.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Prepare Application Package",
    detail: "Assemble stamped architectural plans, structural calculations, energy compliance documentation, and contractor credentials. All plan sets must be coordinated and complete.",
    timeline: "Varies",
  },
  {
    step: 3,
    name: "Submit to Worcester ISD",
    detail: "Submit in person at Worcester City Hall, 455 Main St, or through the online permit portal for qualifying project types. Pay the permit fee at submission. Large commercial projects should contact the ISD for a pre-submission meeting.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Plan Review",
    detail: "Worcester ISD reviews for compliance with the Massachusetts State Building Code (9th Edition), energy code, and zoning. Residential: 3–5 weeks. Commercial and larger projects: 5–8 weeks. Correction letters (deficiency notices) may be issued requiring plan revisions.",
    timeline: "4–6 weeks typical",
  },
  {
    step: 5,
    name: "Permit Issuance & Inspections",
    detail: "Post the permit on-site before starting any work. Schedule required inspections through the ISD. Keep approved stamped plans on-site at all times. Inspections include foundation, framing, insulation, rough MEP, and final.",
    timeline: "Within 5 days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Incomplete plan set — missing required sheets",
    fix: "Worcester requires a complete set: site plan, foundation plan, floor plans, roof plan, elevations, sections, and all schedules. Submit all sheets stamped and titled correctly.",
  },
  {
    issue: "Energy compliance report outdated or mismatched",
    fix: "Update REScheck/COMcheck whenever plans change. The energy compliance report must reference the submitted plans exactly — same window sizes, insulation values, and building envelope.",
  },
  {
    issue: "Historic district review skipped",
    fix: "Check the Worcester HDC map before finalizing plans. Historic district review for exterior changes can add 4–8 weeks and may require design revisions.",
  },
  {
    issue: "Contractor not licensed in Massachusetts",
    fix: "All contractors must hold current Massachusetts HIC or CSL licenses, verified on OCABR.gov. Out-of-state contractors cannot pull permits in Worcester.",
  },
  {
    issue: "Structural PE stamp missing",
    fix: "Structural calculations must be stamped by a Massachusetts-licensed PE. Structural elements must match what's shown on architectural plans.",
  },
];

const PRO_TIPS = [
  "Worcester is experiencing significant redevelopment investment — the Planning & Regulatory Services department can provide free pre-application guidance for commercial projects.",
  "Worcester's downtown core has specific design standards — confirm with the Planning Department whether your project triggers design review.",
  "Worcester accepted MBTA Communities Act compliance — ADU projects on qualifying lots now receive by-right approval. Confirm setback requirements with ISD.",
  "Trade permits (electrical, plumbing, HVAC, gas) must be filed separately and are required before final inspection.",
  "For projects in Worcester's enterprise zones or designated redevelopment areas, tax incentives may be available. Contact the Economic Development Office.",
  "If you receive a deficiency notice, respond promptly — Worcester ISD typically closes applications after 45 days without response.",
];

export default function WorcesterBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#0F172A', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
        <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Worcester</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#14B8A6]">Worcester ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Worcester Building Permit Guide
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-3xl">
          The Worcester Inspectional Services Division issues building permits for all construction,
          renovation, and change-of-use work in Worcester, MA — the second largest city in New England.
          Here&apos;s everything developers need to know about the Worcester permit process.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            4–6 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0F172A] text-[#94A3B8] px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            455 Main St, Worcester
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full">
            <DollarSign className="h-3.5 w-3.5" />
            Fee based on construction cost
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Worcester — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Inspectional Services",
              address: "455 Main St, Worcester City Hall",
              detail: "Mon–Fri 8:30 AM–4:30 PM",
              phone: "508-799-1180",
            },
            {
              label: "Online Permit Portal",
              address: "worcesterma.gov/permits",
              detail: "Online applications for residential and small commercial",
              phone: null,
            },
            {
              label: "Zoning Board of Appeals",
              address: "455 Main St, Worcester",
              detail: "Variances and special permits — meets monthly",
              phone: "508-799-1180",
            },
          ].map((c) => (
            <div key={c.label} className="bg-[#0F172A] border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">{c.label}</p>
              <p className="font-semibold text-white text-sm">{c.address}</p>
              <p className="text-sm text-[#94A3B8] mt-0.5">{c.detail}</p>
              {c.phone && (
                <p className="flex items-center gap-1 text-sm text-[#94A3B8] mt-1">
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Required Documents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Required Documents</h2>
        <div className="space-y-3">
          {REQUIRED_DOCS.map((doc) => (
            <div
              key={doc.name}
              className={`border rounded-xl p-5 ${doc.critical ? "border-[rgba(20,184,166,0.25)] bg-[rgba(20,184,166,0.08)]" : "border-white/10 bg-[#1E293B]"}`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`h-5 w-5 mt-0.5 flex-shrink-0 ${doc.critical ? "text-[#14B8A6]" : "text-[#64748B]"}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{doc.name}</p>
                    {doc.critical && (
                      <span className="text-xs font-medium bg-[rgba(20,184,166,0.1)] text-[#14B8A6] px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </div>
                  <p className="text-sm text-[#94A3B8] mt-1">{doc.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fee Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Fee Schedule</h2>
        <div className="border border-white/10 rounded-2xl overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0F172A] border-b border-white/10">
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Construction Cost</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Permit Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {[
                ["Up to $1,000", "$40 minimum"],
                ["$1,001 – $10,000", "$40 + $8 per $1,000 over $1,000"],
                ["$10,001 – $100,000", "$112 + $10 per $1,000 over $10,000"],
                ["$100,001 – $500,000", "$1,012 + $8 per $1,000 over $100,000"],
                ["Over $500,000", "$4,212 + $7 per $1,000 over $500,000"],
              ].map(([cost, fee]) => (
                <tr key={cost}>
                  <td className="px-6 py-3 text-sm font-medium text-white">{cost}</td>
                  <td className="px-6 py-3 text-sm text-[#94A3B8]">{fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#64748B]">
          Fees are based on declared construction cost at time of application. Trade permits (electrical, plumbing, HVAC, gas) are separate applications and billed separately.
        </p>
      </section>

      {/* Process Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Step-by-Step Process</h2>
        <div className="space-y-4">
          {PROCESS_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-bold">
                {step.step}
              </div>
              <div className="flex-1 pb-6 border-b border-white/6 last:border-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <p className="font-semibold text-white">{step.name}</p>
                  <span className="text-xs font-medium bg-[#0F172A] text-[#94A3B8] px-2.5 py-1 rounded-full flex-shrink-0">
                    {step.timeline}
                  </span>
                </div>
                <p className="text-[#94A3B8] mt-1 text-sm">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Rejections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Common Rejections &amp; How to Avoid Them</h2>
        <div className="space-y-3">
          {COMMON_REJECTIONS.map((r) => (
            <div key={r.issue} className="border border-amber-700/30 bg-amber-900/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{r.issue}</p>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    <strong className="text-green-400">Fix: </strong>{r.fix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Pro Tips for Worcester Developers</h2>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 space-y-3">
          {PRO_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#94A3B8]">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Related Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/permits/worcester/zoning-board", label: "Worcester Zoning Board Guide", desc: "ZBA variances, special permits, hearing process" },
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements, stamped plans, fee schedule" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit Guide", desc: "By-right ADUs post-MBTA Communities Act" },
            { href: "/permits/springfield/building-permit", label: "Springfield Building Permit Guide", desc: "Western MA building department requirements" },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:border-[#14B8A6]/40 hover:bg-[rgba(20,184,166,0.08)] transition-all group"
            >
              <div>
                <p className="font-medium text-white group-hover:text-[#14B8A6] transition-colors text-sm">{g.label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{g.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#64748B] group-hover:text-[#14B8A6] flex-shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)", border: "1px solid rgba(20,184,166,0.25)" }}>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Track Your Worcester Permit in MeritLayer
          </h2>
          <p className="text-[#94A3B8] mb-6">
            Upload your permit application, track the Worcester ISD review timeline, monitor
            deficiency notices, and get automated alerts at every milestone.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#1E293B] text-[#14B8A6] font-semibold px-6 py-3 rounded-xl hover:bg-[rgba(20,184,166,0.08)] transition-colors"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/permits"
              className="inline-flex items-center gap-2 bg-[rgba(20,184,166,0.12)] text-white font-medium px-6 py-3 rounded-xl hover:bg-[rgba(20,184,166,0.15)] transition-colors"
            >
              More Permit Guides
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
