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
  title: "Quincy Building Permit Guide 2026 | Requirements & Fees | MeritLayer",
  description:
    "Complete Quincy MA building permit guide: required documents, fee schedule, 4–6 week timeline, common rejections, and pro tips for developers. Quincy Inspectional Services.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Must include site plan, floor plans, elevations, and sections. Two sets required for Quincy ISD.",
    critical: true,
  },
  {
    name: "Structural Calculations",
    detail: "PE-stamped structural calculations for any new construction, additions, or structural modifications. Required for all work affecting load-bearing systems, foundations, or roof structure.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "Compliance with the Massachusetts Energy Code. REScheck (residential) or COMcheck (commercial) report required for new construction and major renovations.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Copy of the current recorded deed. Contractors must include an authorization letter from the property owner.",
    critical: false,
  },
  {
    name: "Property Survey / Plot Plan",
    detail: "Certified plot plan showing property lines, setbacks, and proposed work. Required for new construction, additions, and any work affecting setbacks.",
    critical: false,
  },
  {
    name: "Contractor License & Insurance",
    detail: "Massachusetts HIC license for residential work over $1,000. CSL for structural work. Certificate of liability insurance naming the City of Quincy as additional insured.",
    critical: true,
  },
  {
    name: "Zoning Board Approval (if required)",
    detail: "If your project requires a variance from the Quincy Zoning Board of Appeals, obtain their approval letter before applying for a building permit.",
    critical: false,
  },
  {
    name: "Coastal/Wetlands Approval (if applicable)",
    detail: "Quincy has significant coastal areas. Projects near wetlands, waterways, or coastal areas may require Conservation Commission Order of Conditions before permit issuance.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Pre-Application Zoning Check",
    detail: "Review your project against Quincy's Zoning Ordinance. Quincy has mixed residential, commercial, and industrial zones near the waterfront. Contact the Inspectional Services Department for clarification on setbacks, FAR limits, and use restrictions.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Conservation/Coastal Review (if applicable)",
    detail: "If your project is near wetlands or the coast, file with the Quincy Conservation Commission first. An Order of Conditions is required before building permit issuance. Factor in 30–60 days.",
    timeline: "30–60 days if required",
  },
  {
    step: 3,
    name: "Prepare Application Package",
    detail: "Assemble all required documents. Your architect should coordinate with the structural engineer to ensure full consistency. Energy compliance must match the submitted drawings.",
    timeline: "Varies",
  },
  {
    step: 4,
    name: "Submit to Quincy ISD",
    detail: "Submit your application in person at Quincy City Hall, 1305 Hancock St, or through the online portal. Pay the application fee at submission.",
    timeline: "Day 1",
  },
  {
    step: 5,
    name: "Plan Review & Permit Issuance",
    detail: "Quincy ISD reviews plans for compliance with the Massachusetts State Building Code (9th Edition), energy code, and zoning. Residential: 3–5 weeks. Commercial: 5–8 weeks. Post the permit on-site before starting work.",
    timeline: "3–6 weeks typical",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Missing Conservation Commission approval for coastal/wetland sites",
    fix: "Check Quincy's GIS maps for wetland resource areas before any site work. File with the Conservation Commission early — the process takes 30–60 days and cannot be bypassed.",
  },
  {
    issue: "Zoning violations for waterfront or mixed-use projects",
    fix: "Quincy's waterfront zones have unique use and setback requirements. Confirm your use category with ISD before finalizing plans. ZBA variances add 2–3 months.",
  },
  {
    issue: "Incomplete architectural plans",
    fix: "Plans must include all required sheets: site plan, floor plans, elevations, sections, and energy compliance. Missing sheets are the most common cause of initial rejection.",
  },
  {
    issue: "Contractor credentials not current",
    fix: "Verify CSL/HIC status on OCABR.gov before filing. Insurance certificates must name the City of Quincy and be current.",
  },
  {
    issue: "Structural PE stamp missing or from out-of-state engineer",
    fix: "Structural calculations must be stamped by a licensed Massachusetts PE. Out-of-state engineers need a Massachusetts stamp.",
  },
];

const PRO_TIPS = [
  "Quincy's waterfront and coastal areas require Conservation Commission review — factor this into your project schedule early.",
  "For commercial projects near Quincy Center, check the Downtown Quincy Zoning District requirements which have additional design standards.",
  "Quincy accepts online permit applications for many project types — check the city portal before making an in-person trip.",
  "Trade permits (electrical, plumbing, HVAC) are separate applications and can be filed after the building permit is in review.",
  "Quincy's DPW may require street opening or utility permits for projects with site work. Coordinate early.",
  "If you receive a deficiency letter, respond within 30 days to avoid having your application closed.",
];

export default function QuincyBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#080D1A', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
        <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Quincy</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#14B8A6]">Quincy ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Quincy Building Permit Guide
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-3xl">
          The Quincy Inspectional Services Department issues building permits for all construction,
          renovation, and change-of-use work in Quincy, MA. Coastal and wetland sites require additional
          Conservation Commission review. Here&apos;s everything developers need to know.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            3–6 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#111827] text-[#94A3B8] px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            1305 Hancock St, Quincy
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full">
            <DollarSign className="h-3.5 w-3.5" />
            Fee based on construction cost
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quincy — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Inspectional Services",
              address: "1305 Hancock St, Quincy City Hall",
              detail: "Mon–Fri 8:30 AM–4:30 PM",
              phone: "617-376-1090",
            },
            {
              label: "Online Permits Portal",
              address: "quincyma.gov/permits",
              detail: "Apply and track online for most project types",
              phone: null,
            },
            {
              label: "Conservation Commission",
              address: "1305 Hancock St, Quincy",
              detail: "Coastal/wetland projects — required before building permit",
              phone: "617-376-1063",
            },
          ].map((c) => (
            <div key={c.label} className="bg-[#111827] border border-white/10 rounded-xl p-4">
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
              className={`border rounded-xl p-5 ${doc.critical ? "border-[rgba(20,184,166,0.25)] bg-[rgba(20,184,166,0.08)]" : "border-white/10 bg-[#0D1525]"}`}
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
              <tr className="bg-[#111827] border-b border-white/10">
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Construction Cost</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Permit Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {[
                ["Up to $1,000", "$35 minimum"],
                ["$1,001 – $10,000", "$35 + $7 per $1,000 over $1,000"],
                ["$10,001 – $100,000", "$98 + $9 per $1,000 over $10,000"],
                ["$100,001 – $500,000", "$908 + $7 per $1,000 over $100,000"],
                ["Over $500,000", "$3,708 + $6 per $1,000 over $500,000"],
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
          Fees are based on declared construction cost. Trade permits (electrical, plumbing, HVAC) are separate applications. Conservation Commission filing fees apply for coastal/wetland sites.
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
                  <span className="text-xs font-medium bg-[#111827] text-[#94A3B8] px-2.5 py-1 rounded-full flex-shrink-0">
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
        <h2 className="text-2xl font-bold text-white mb-4">Pro Tips for Quincy Developers</h2>
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 space-y-3">
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
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements, stamped plans, fee schedule" },
            { href: "/permits/boston/certificate-of-occupancy", label: "Certificate of Occupancy Guide", desc: "Final inspection sequence and sign-offs" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit Guide", desc: "By-right ADUs post-MBTA Communities Act" },
            { href: "/permits/worcester/building-permit", label: "Worcester Building Permit Guide", desc: "Worcester ISD requirements and fees" },
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
            Track Your Quincy Permit in MeritLayer
          </h2>
          <p className="text-[#94A3B8] mb-6">
            Upload your permit application, track the Quincy ISD review timeline, monitor correction
            letters, and get automated alerts at every milestone.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#0D1525] text-[#14B8A6] font-semibold px-6 py-3 rounded-xl hover:bg-[rgba(20,184,166,0.08)] transition-colors"
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
