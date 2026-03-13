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
  title: "Waltham Building Permit Guide 2026 | Requirements & Fees | MeritLayer",
  description:
    "Complete Waltham MA building permit guide: required documents, fee schedule, 3–5 week timeline, common rejections, and pro tips for developers. Waltham Building Department.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Include site plan, floor plans, elevations, and sections. Two sets required for the Waltham Building Department.",
    critical: true,
  },
  {
    name: "Structural Calculations",
    detail: "PE-stamped structural calculations for new construction, additions, or any structural modifications. Required for all work affecting load-bearing elements, foundations, or roof structure.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "REScheck (residential) or COMcheck (commercial) energy compliance report. Must align precisely with submitted architectural plans.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Current recorded deed showing the property owner. Contractors must include a signed authorization letter from the property owner.",
    critical: false,
  },
  {
    name: "Property Survey / Plot Plan",
    detail: "Certified survey or plot plan showing property lines, setbacks, existing structures, and proposed work. Required for all new construction and additions.",
    critical: false,
  },
  {
    name: "Contractor License & Insurance",
    detail: "Massachusetts HIC license for residential work over $1,000. CSL for structural work. Certificate of liability insurance naming the City of Waltham as additional insured.",
    critical: true,
  },
  {
    name: "ZBA Decision (if required)",
    detail: "If a variance was required, include the Waltham ZBA decision letter. The building permit cannot be issued until ZBA approval is in hand.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Zoning Pre-Application Review",
    detail: "Confirm your project complies with Waltham's Zoning Ordinance. Waltham has a mix of residential, commercial, and industrial zones. The Building Department can provide a zoning opinion letter upon request.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Prepare Application Package",
    detail: "Assemble stamped architectural plans, structural calculations, energy compliance docs, and contractor credentials. Ensure all plan sets are consistent and complete.",
    timeline: "Varies",
  },
  {
    step: 3,
    name: "Submit to Waltham Building Department",
    detail: "Submit at Waltham City Hall, 610 Main St, or online through the city portal. Pay the permit fee at submission. The Building Department will log your application and assign a plan reviewer.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Plan Review",
    detail: "The Building Department reviews plans for compliance with the Massachusetts State Building Code (9th Edition), energy code, and local zoning. Residential: 2–4 weeks. Commercial: 4–6 weeks. Correction letters may be issued requiring plan revisions.",
    timeline: "3–5 weeks typical",
  },
  {
    step: 5,
    name: "Permit Issuance & Inspections",
    detail: "Once approved, post the permit on-site before starting work. Schedule required inspections (foundation, framing, insulation, final) through the Building Department. Keep stamped approved plans on-site.",
    timeline: "Within 5 days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Plans not stamped or incomplete",
    fix: "Waltham requires fully stamped and coordinated plan sets. Ensure all sheets are included: site plan, foundation, floor plans, elevations, sections, and schedules.",
  },
  {
    issue: "Energy compliance document mismatch",
    fix: "REScheck/COMcheck must exactly reference the submitted plan set. Update energy compliance documentation whenever plans are revised.",
  },
  {
    issue: "Setback violations for additions",
    fix: "Waltham has specific setback requirements by zone. Verify compliance with a plot plan before finalizing plans. ZBA variances add 8–12 weeks.",
  },
  {
    issue: "Contractor not registered or insurance expired",
    fix: "Verify CSL/HIC status on OCABR.gov. Insurance certificates must name the City of Waltham and list all required coverage amounts.",
  },
  {
    issue: "Structural calcs PE stamp missing",
    fix: "Any structural engineer signing plans must hold a valid Massachusetts PE license. Verify before submission.",
  },
];

const PRO_TIPS = [
  "Waltham's Building Department is known for being developer-friendly — a pre-submission call can clarify requirements and save weeks.",
  "For commercial projects along Route 128/I-95, confirm traffic impact requirements with the DPW before filing.",
  "Waltham's online permit portal allows status tracking — check online before calling the office.",
  "Trade permits (electrical, plumbing, HVAC) can be filed concurrently with the building permit review.",
  "For projects in Waltham's Research & Development zones, confirm use is permitted before investing in full plans.",
  "Waltham is part of the MBTA Communities Act — ADU projects now qualify for by-right approval. Confirm setback rules with the Building Department.",
];

export default function WalthamBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#0F172A', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
        <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Waltham</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#14B8A6]">Waltham Building Dept — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Waltham Building Permit Guide
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-3xl">
          The Waltham Building Department issues building permits for all construction, renovation,
          and change-of-use work in Waltham, MA. Known for a practical, developer-friendly process —
          here&apos;s everything you need to know before you apply.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            3–5 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0F172A] text-[#94A3B8] px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            610 Main St, Waltham
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full">
            <DollarSign className="h-3.5 w-3.5" />
            Fee based on construction cost
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Waltham — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Building Department",
              address: "610 Main St, Waltham City Hall",
              detail: "Mon–Fri 8:30 AM–4:30 PM",
              phone: "781-314-3340",
            },
            {
              label: "Online Portal",
              address: "waltham.ma.us/permits",
              detail: "Online applications and permit tracking",
              phone: null,
            },
            {
              label: "Zoning Board of Appeals",
              address: "610 Main St, Waltham",
              detail: "Variances, special permits — meet monthly",
              phone: "781-314-3340",
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
                ["Up to $1,000", "$30 minimum"],
                ["$1,001 – $10,000", "$30 + $7 per $1,000 over $1,000"],
                ["$10,001 – $100,000", "$93 + $9 per $1,000 over $10,000"],
                ["$100,001 – $500,000", "$903 + $7 per $1,000 over $100,000"],
                ["Over $500,000", "$3,703 + $5 per $1,000 over $500,000"],
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
          Fees are based on declared construction cost. Trade permits are billed separately. Confirm current fee schedule directly with the Waltham Building Department before applying.
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
        <h2 className="text-2xl font-bold text-white mb-4">Pro Tips for Waltham Developers</h2>
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
            { href: "/permits/newton/building-permit", label: "Newton Building Permit Guide", desc: "Newton ISD requirements and historic district rules" },
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements, stamped plans, fee schedule" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit Guide", desc: "By-right ADUs post-MBTA Communities Act" },
            { href: "/permits/cambridge/building-permit", label: "Cambridge Building Permit Guide", desc: "ISD, BZA, and LEED requirements" },
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
            Track Your Waltham Permit in MeritLayer
          </h2>
          <p className="text-[#94A3B8] mb-6">
            Upload your permit application, track the Waltham Building Department review timeline,
            monitor correction letters, and get automated alerts at every milestone.
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
