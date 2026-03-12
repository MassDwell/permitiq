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
  title: "Boston Building Permit Guide 2026 | ISD Requirements & Fees | MeritLayer",
  description:
    "Complete Boston ISD building permit guide: required documents, stamped plans, structural calcs, energy compliance, fees, 4–8 week timeline, common rejections, and pro tips for developers.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Must include site plan, floor plans, elevations, and sections. Two sets required for ISD, additional sets for trade permits.",
    critical: true,
  },
  {
    name: "Structural Calculations",
    detail: "PE-stamped structural calculations for any new construction, additions, or structural modifications. Required for all work affecting the load-bearing system, foundations, or roof structure.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation (IECC)",
    detail: "Compliance with the Massachusetts Energy Code (based on IECC). For new construction and major renovations: REScheck (residential) or COMcheck (commercial) report or equivalent energy analysis.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Copy of the current recorded deed showing current owner. If applying as contractor, include an authorization letter from the property owner.",
    critical: false,
  },
  {
    name: "Property Survey / Plot Plan",
    detail: "Certified plot plan or survey showing property lines, existing structures, setbacks, and proposed work. Must be prepared by a licensed land surveyor for new construction.",
    critical: false,
  },
  {
    name: "Contractor License & Insurance",
    detail: "Massachusetts Home Improvement Contractor (HIC) license for residential work over $1,000. Construction Supervisor License (CSL) for structural work. Certificate of liability insurance naming the City of Boston as additional insured.",
    critical: true,
  },
  {
    name: "Zoning Determination",
    detail: "If your project requires a zoning variance or special permit, you must receive ZBA approval before ISD will issue a building permit. Include the ZBA decision letter.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Pre-Application Zoning Check",
    detail: "Verify your project complies with Boston's Zoning Code (Article 2A for as-of-right projects). Use the Boston Zoning Viewer at bostonplans.org to check your zoning district, setbacks, FAR, and height limits. If your project doesn't comply, file with ZBA before applying for a building permit.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Prepare Application Package",
    detail: "Assemble all required documents. Your architect should coordinate with the structural engineer to ensure plans are fully stamped and consistent. REScheck or COMcheck must match the drawings exactly.",
    timeline: "Varies",
  },
  {
    step: 3,
    name: "Submit to Boston ISD",
    detail: "Submit your application online via the Boston Permits portal (permits.boston.gov) or in person at 1010 Massachusetts Ave. For larger commercial projects, you may be directed to the Major Project Unit. Pay the application fee at submission.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Plan Review",
    detail: "ISD reviews plans for compliance with the Massachusetts State Building Code (9th Edition), energy code, accessibility requirements, and zoning. Residential permits under 35,000 sq ft: 30–60 days. Larger commercial: 60–90+ days. You may receive a correction letter (\"deficiency letter\") requiring plan revisions.",
    timeline: "4–8 weeks typical",
  },
  {
    step: 5,
    name: "Permit Issuance",
    detail: "Once approved, pay the full permit fee (based on construction cost). Post the permit on-site in a visible location before starting any work. Keep the stamped approved plans on-site at all times.",
    timeline: "Within 5 days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Incomplete or inconsistent plans",
    fix: "Ensure architectural, structural, and MEP drawings are coordinated. Common problem: plans list one window size, schedule shows another.",
  },
  {
    issue: "Energy compliance documentation missing or mismatched",
    fix: "REScheck/COMcheck must reference the exact plans submitted. If plans change, rerun energy compliance.",
  },
  {
    issue: "Setback or zoning violations not resolved",
    fix: "Obtain ZBA approval first. Don't submit a building permit application while a ZBA case is pending unless specifically directed to.",
  },
  {
    issue: "Contractor license or insurance not current",
    fix: "Verify your CSL/HIC is active on the OCABR website before filing. Insurance certificates must not be expired.",
  },
  {
    issue: "Structural calcs not PE-stamped",
    fix: "Any structural engineer of record must hold a current Massachusetts PE license. Out-of-state engineers must obtain a Massachusetts stamp.",
  },
];

const PRO_TIPS = [
  "Request a pre-application meeting with ISD for complex projects — available for large commercial and mixed-use developments.",
  "Track your application status online at permits.boston.gov using your permit number.",
  "For residential projects in flood zones, FEMA Elevation Certificates add 2–4 weeks. Start flood compliance early.",
  "Trade permits (electrical, plumbing, HVAC) are separate applications and can be submitted after the building permit is in review.",
  "Boston has a fast-track residential program for projects under a certain size threshold — ask ISD at intake if you qualify.",
  "If you receive a deficiency letter, respond within 30 days or your application may be closed.",
];

export default function BostonBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Boston</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Boston ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Boston Building Permit Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The Boston Inspectional Services Department (ISD) issues building permits for all
          construction, demolition, renovation, and change-of-use work in Boston. Here's everything
          you need to know — required documents, fees, timeline, and how to avoid costly rejections.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            4–8 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            1010 Massachusetts Ave, Boston
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            <DollarSign className="h-3.5 w-3.5" />
            Fee based on construction cost
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Boston ISD — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Permit Counter",
              address: "1010 Massachusetts Ave, 4th Floor",
              detail: "Walk-in: Mon–Fri 8 AM–4 PM",
              phone: "617-635-5300",
            },
            {
              label: "Online Portal",
              address: "permits.boston.gov",
              detail: "Apply, track status, pay fees online",
              phone: null,
            },
            {
              label: "Major Projects Unit",
              address: "1010 Massachusetts Ave, 5th Floor",
              detail: "Projects ≥35,000 sq ft or complex commercial",
              phone: "617-635-5399",
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
                ["$1,001 – $5,000", "$25 + $5 per $1,000 over $1,000"],
                ["$5,001 – $100,000", "$45 + $8 per $1,000 over $5,000"],
                ["$100,001 – $500,000", "$805 + $7 per $1,000 over $100,000"],
                ["Over $500,000", "$3,605 + $6 per $1,000 over $500,000"],
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
          Fees are based on the declared construction cost at time of application. ISD may audit cost declarations and adjust fees. Trade permits (electrical, plumbing, HVAC, gas) are billed separately.
        </p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips for Boston Developers</h2>
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
            { href: "/permits/boston/zba-variance", label: "Boston ZBA Variance Guide", desc: "When your project doesn't comply with zoning" },
            { href: "/permits/boston/article-85-demolition", label: "Article 85 Demolition Delay", desc: "18-month delay for structures over 50 years old" },
            { href: "/permits/boston/certificate-of-occupancy", label: "Certificate of Occupancy", desc: "Final inspection sequence and sign-offs" },
            { href: "/permits/boston/article-80-review", label: "Article 80 Review", desc: "Large project (≥50k sq ft) BPDA review process" },
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
            Track Your Boston Permit in MeritLayer
          </h2>
          <p className="text-blue-100 mb-6">
            Upload your permit application, track the ISD review timeline, monitor deficiency letters,
            and get automated alerts at every milestone — so nothing falls through the cracks.
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
