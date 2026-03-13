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
  Landmark,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Brookline Building Permit Guide 2026 | Building Department Requirements | MeritLayer",
  description:
    "Complete Town of Brookline building permit guide: 4–8 week timeline, historical commission review, design review for additions over 2,500 sqft, required documents, fees, and developer tips.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full architectural plan set stamped by a Massachusetts-licensed architect. Required: site plan, floor plans, elevations, sections, and life-safety plan. Two physical sets required for in-person submission; PDF accepted for online applications.",
    critical: true,
  },
  {
    name: "Structural Calculations (PE-Stamped)",
    detail: "PE-stamped structural calculations for new construction, additions, or any structural modifications. Brookline Building Department may request peer review for complex structural systems on larger projects.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "Massachusetts Energy Code compliance (REScheck for residential, COMcheck for commercial). Brookline enforces the Stretch Energy Code for new construction — confirm with the Building Department at intake.",
    critical: true,
  },
  {
    name: "Historical Commission Review (if applicable)",
    detail: "For properties in one of Brookline's local historic districts (e.g., Harvard Street, Pill Hill), review and approval by the Brookline Historical Commission is required before a building permit is issued. Allow 4–8 additional weeks for this review.",
    critical: false,
  },
  {
    name: "Design Review Board Approval (≥2,500 sqft addition)",
    detail: "Projects involving an addition of 2,500 sq ft or more in Brookline require review and approval by the Design Review Board (DRB) before a building permit is issued. Engage the DRB early — their process typically takes 4–6 weeks.",
    critical: false,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Current recorded deed or title. Contractor applications require a written owner authorization letter.",
    critical: false,
  },
  {
    name: "Survey / Plot Plan",
    detail: "Certified survey showing property lines, existing structures, setbacks, and proposed work. Required for new construction; certified by a licensed Massachusetts land surveyor.",
    critical: false,
  },
  {
    name: "Contractor Credentials",
    detail: "Massachusetts Construction Supervisor License (CSL) for structural work. HIC license for residential work over $1,000. Liability insurance certificate naming the Town of Brookline as additional insured.",
    critical: true,
  },
  {
    name: "ZBA Decision (if applicable)",
    detail: "If the project required a variance or special permit from the Brookline ZBA, include the approved decision letter. The building permit cannot be issued until the ZBA decision is final.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Zoning & Historical Commission Pre-Check",
    detail: "Verify compliance with Brookline's Zoning By-law. Check whether the property is in a local historic district using Brookline's GIS portal. If historical commission review applies, begin that process immediately — it runs concurrently but must be completed before the building permit is issued.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Design Review Board (if required)",
    detail: "For additions ≥2,500 sq ft, schedule a pre-application meeting with the Design Review Board. The DRB reviews projects for architectural design quality, massing, and compatibility with the surrounding neighborhood. Present preliminary drawings and be prepared for multiple review sessions.",
    timeline: "4–6 weeks",
  },
  {
    step: 3,
    name: "Prepare Application Package",
    detail: "Coordinate architectural, structural, and energy documentation. Ensure REScheck/COMcheck exactly matches the submitted plans. Include all required approvals (Historical Commission, DRB, ZBA) in the package.",
    timeline: "Varies",
  },
  {
    step: 4,
    name: "Submit to Brookline Building Department",
    detail: "Submit online via brooklinema.gov or in person at Town Hall, 333 Washington St, 1st Floor. Pay the application fee at submission. Brookline Building Department reviews for completeness before assigning a plan reviewer.",
    timeline: "Day 1",
  },
  {
    step: 5,
    name: "Plan Review",
    detail: "The Brookline Building Department reviews for Massachusetts State Building Code (9th Edition), energy code, zoning, and accessibility compliance. Residential: 3–4 weeks. Commercial and mixed-use: 5–8 weeks. Deficiency letters must be responded to within 30 days.",
    timeline: "4–8 weeks typical",
  },
  {
    step: 6,
    name: "Permit Issuance",
    detail: "Once all reviews are complete and the permit fee is paid, post the permit on-site before starting work. Keep approved stamped plans on-site at all times during construction.",
    timeline: "Within 5 business days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Missing Historical Commission approval for historic district properties",
    fix: "Check Brookline's GIS for historic district boundaries before submission. Start the Historical Commission process simultaneously with your design development — do not wait until you're ready to pull a permit.",
  },
  {
    issue: "Design Review Board process not initiated for large additions",
    fix: "Any addition of 2,500 sq ft or more requires DRB approval. Engage the DRB during schematic design — changes required at the DRB stage are expensive if the project is already in design development.",
  },
  {
    issue: "Plans don't comply with Brookline's strict setback requirements",
    fix: "Brookline's Zoning By-law has granular setback, FAR, and height rules that vary by district. Use Brookline's online GIS to check your district's requirements. Setback violations require ZBA relief before the building permit can proceed.",
  },
  {
    issue: "Stretch Energy Code documentation insufficient",
    fix: "Brookline enforces the Stretch Energy Code. Confirm the correct code version with the Building Department at intake and ensure your energy consultant is current on Massachusetts Stretch requirements.",
  },
  {
    issue: "Trade permits not filed separately",
    fix: "Brookline requires separate applications for electrical, plumbing, and HVAC permits. These can be submitted concurrently with the building permit review but are not included in the building permit.",
  },
];

const PRO_TIPS = [
  "Brookline's Historical Commission is highly active. If your project is anywhere near a historic district, engage their staff before even beginning design — their preferences on materials and massing will affect your design.",
  "The Design Review Board process for additions ≥2,500 sq ft can be shortened by submitting high-quality renderings and contextual studies that demonstrate neighborhood compatibility at the first meeting.",
  "Brookline has some of the most restrictive residential setbacks in Greater Boston. Verify setbacks for your specific zoning district before committing to a design.",
  "Brookline allows online permit applications for most project types — take advantage of this to avoid in-person visits and expedite the completeness review.",
  "Pre-application meetings are available for complex projects. Brookline Building Department staff can identify likely issues before you invest in full construction documents.",
  "If your project involves an older structure (pre-1950), be prepared for asbestos and lead paint assessments — these are required for demolition work and may affect your permit package.",
];

export default function BrooklineBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#080D1A', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
        <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Brookline</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#14B8A6]">Town of Brookline Building Department — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Brookline Building Permit Guide
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-3xl">
          The Town of Brookline Building Department issues building permits for all construction,
          renovation, and demolition work in Brookline. Brookline is known for strict historical
          commission review and design review requirements for larger additions — here&apos;s what
          developers need to know.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            4–8 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#111827] text-[#94A3B8] px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            333 Washington St, Brookline Town Hall
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-900/20 text-amber-400 px-3 py-1.5 rounded-full">
            <Landmark className="h-3.5 w-3.5" />
            Historical Commission review required in historic districts
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-900/20 text-purple-400 px-3 py-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5" />
            Design Review for additions ≥2,500 sqft
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Brookline Building Department — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Building Department",
              address: "333 Washington St, 1st Floor, Brookline",
              detail: "Mon–Fri 8:30 AM–4:30 PM (Thu until 7 PM)",
              phone: "617-730-2090",
            },
            {
              label: "Online Portal",
              address: "brooklinema.gov/permits",
              detail: "Online applications and permit status",
              phone: null,
            },
            {
              label: "Historical Commission",
              address: "333 Washington St, Brookline Town Hall",
              detail: "Historic district review and approvals",
              phone: "617-730-2089",
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
                ["Up to $1,000", "$25 minimum"],
                ["$1,001 – $5,000", "$35 + $6 per $1,000 over $1,000"],
                ["$5,001 – $100,000", "$59 + $9 per $1,000 over $5,000"],
                ["$100,001 – $500,000", "$914 + $8 per $1,000 over $100,000"],
                ["Over $500,000", "$4,114 + $7 per $1,000 over $500,000"],
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
          Fee schedule simplified for illustration. Confirm current fees with Brookline Building Department. Trade permits, Design Review Board fees, and Historical Commission fees are billed separately.
        </p>
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
        <h2 className="text-2xl font-bold text-white mb-4">Common Issues &amp; How to Avoid Them</h2>
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
        <h2 className="text-2xl font-bold text-white mb-4">Pro Tips for Brookline Developers</h2>
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
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements for projects in Boston" },
            { href: "/permits/cambridge/building-permit", label: "Cambridge Building Permit", desc: "LEED and green building requirements" },
            { href: "/permits/somerville/building-permit", label: "Somerville Building Permit", desc: "SomerVision 2022 zoning, 2–4 week timeline" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit", desc: "By-right ADUs under the MBTA Communities Act" },
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
            Track Your Brookline Permit in MeritLayer
          </h2>
          <p className="text-[#94A3B8] mb-6">
            Upload your Brookline permit application, track Historical Commission and Design Review
            Board milestones, and get automated alerts at every stage of the review process.
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
