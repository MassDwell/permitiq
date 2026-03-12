import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Building2,
  KeyRound,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boston Certificate of Occupancy Guide 2026 | Final Inspection Sequence | MeritLayer",
  description:
    "Complete guide to getting a Certificate of Occupancy in Boston: final inspection sequence, required sign-offs, Temporary CO vs permanent CO, common delays, and how to close out your project.",
};

const INSPECTION_SEQUENCE = [
  {
    step: 1,
    dept: "Building Inspector (ISD)",
    name: "Final Building Inspection",
    detail: "Covers structural completion, fire-rated assemblies, egress, stairways, handrails, doors, and general code compliance. Must pass before any other final inspections are booked.",
    required: true,
  },
  {
    step: 2,
    dept: "Plumbing Inspector (ISD)",
    name: "Final Plumbing Inspection",
    detail: "Covers all plumbing fixtures, connections, water heater, gas piping (if applicable), and drain/waste/vent systems. Requires a licensed plumber of record to be present.",
    required: true,
  },
  {
    step: 3,
    dept: "Electrical Inspector (ISD)",
    name: "Final Electrical Inspection",
    detail: "Covers panel, wiring, outlets, lighting, smoke and CO detectors. Requires a licensed electrician of record. NSTAR/Eversource connection may require a separate electrical inspector sign-off.",
    required: true,
  },
  {
    step: 4,
    dept: "Boston Fire Prevention Division",
    name: "Final Fire Inspection",
    detail: "Covers sprinkler systems, fire alarm systems, exit signs, emergency lighting, fire extinguishers, and fire-rated corridor construction. Required for multi-family (3+ units), commercial, and mixed-use buildings.",
    required: false,
  },
  {
    step: 5,
    dept: "Boston Public Works (if applicable)",
    name: "Sidewalk / Right-of-Way Sign-Off",
    detail: "Required if your project included any sidewalk work, curb cuts, or right-of-way disturbance. Must be closed out with Boston Public Works before CO is issued.",
    required: false,
  },
  {
    step: 6,
    dept: "Boston Water & Sewer Commission (if applicable)",
    name: "Sewer & Water Connection Sign-Off",
    detail: "Required for new connections or major alterations to water/sewer service. BWSC issues a sign-off letter that ISD requires for the CO.",
    required: false,
  },
  {
    step: 7,
    dept: "ISD Building Commissioner",
    name: "Certificate of Occupancy Issued",
    detail: "Once all required sign-offs are received, ISD issues the CO. The building may not be legally occupied until this document is in hand and posted.",
    required: true,
  },
];

const COMMON_DELAYS = [
  {
    issue: "Outstanding trade permits not closed out",
    detail: "If your electrical or plumbing permits aren't fully inspected and signed off, ISD will not issue the CO. Close all trade permits before requesting the final building inspection.",
  },
  {
    issue: "Smoke and CO detectors not installed or not tested",
    detail: "Boston requires interconnected smoke detectors on every level and in every bedroom. CO detectors required within 10 feet of sleeping areas. Fire inspection will fail if these aren't in place.",
  },
  {
    issue: "Change orders not reflected in as-built plans",
    detail: "If field changes were made during construction, as-built plans must be submitted to ISD. Inspectors will flag discrepancies between approved plans and the built conditions.",
  },
  {
    issue: "Accessibility requirements not met (ADA / MAAB)",
    detail: "For commercial, mixed-use, and multi-family projects, Massachusetts Architectural Access Board (MAAB) requirements must be satisfied. An MAAB variance may be needed if the building can't achieve full compliance.",
  },
  {
    issue: "Fire alarm or sprinkler systems not commissioned",
    detail: "Sprinkler and fire alarm systems must be tested and the testing report submitted to the Fire Prevention Division before fire inspection. Allow extra time for fire alarm commissioning.",
  },
  {
    issue: "Site not cleaned up / temporary utilities still in place",
    detail: "Inspectors often fail final inspections for housekeeping issues: construction debris, unprotected openings, temp power panels still live. Clean the site before scheduling finals.",
  },
];

const TCO_INFO = [
  {
    title: "What is a Temporary CO?",
    detail: "A Temporary Certificate of Occupancy (TCO) allows occupancy of a portion of a building (e.g., lower floors while upper floors are still being finished) or the full building when minor outstanding items remain. It is typically valid for 30–90 days.",
  },
  {
    title: "When to Request a TCO",
    detail: "Request a TCO when: (a) the building is substantially complete and safe to occupy, (b) only minor punch-list items remain, and (c) a hard move-in deadline requires occupancy before final completion.",
  },
  {
    title: "TCO Conditions",
    detail: "ISD will issue a list of outstanding items that must be completed before the final CO is issued. All outstanding items from the TCO must be resolved within the TCO validity period or it must be renewed.",
  },
  {
    title: "TCO vs. Permanent CO",
    detail: "A TCO is not a permanent CO. Lenders and some tenants require a permanent CO for financing and lease commencement. Plan accordingly — a final CO should be obtained as soon as possible after TCO.",
  },
];

export default function CertificateOfOccupancyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Boston</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">Certificate of Occupancy</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Boston ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Certificate of Occupancy Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The Certificate of Occupancy (CO) is the final milestone in every Boston construction
          project — and the last step before the building can legally be occupied. Here's the exact
          inspection sequence, what to watch out for, and how to close out your project cleanly.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <KeyRound className="h-3.5 w-3.5" />
            Required before legal occupancy
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            Allow 2–4 weeks for all sign-offs
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            <CheckCircle className="h-3.5 w-3.5" />
            Temporary CO available
          </span>
        </div>
      </div>

      {/* What is a CO */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is a Certificate of Occupancy?</h2>
        <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 space-y-3">
          <p>
            A Certificate of Occupancy is an official document issued by Boston ISD certifying that a
            completed building or structure complies with the Massachusetts State Building Code and is
            safe for occupancy. It is required for new construction, major renovations involving a
            change of use or increased occupancy, and additions.
          </p>
          <p>
            <strong className="text-gray-900">You cannot legally occupy</strong> a newly constructed
            or substantially renovated building without a CO. Violating this carries significant
            liability for owners and developers.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Request CO / Finals</p>
              <p className="font-semibold text-gray-900">1010 Massachusetts Ave</p>
              <p className="text-sm text-gray-600">Boston ISD, 4th Floor · 617-635-5300</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fire Inspection</p>
              <p className="font-semibold text-gray-900">Boston Fire Prevention</p>
              <p className="text-sm text-gray-600">115 Southampton St · 617-343-3628</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Inspection Sequence */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Inspection Sequence</h2>
        <div className="space-y-3">
          {INSPECTION_SEQUENCE.map((item) => (
            <div
              key={item.step}
              className={`border rounded-xl p-5 ${item.required ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.required ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.required ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.required ? "Always Required" : "If Applicable"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{item.dept}</p>
                  <p className="text-sm text-gray-700 mt-1.5">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Temporary CO */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Temporary CO vs. Permanent CO</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TCO_INFO.map((item) => (
            <div key={item.title} className="border border-gray-200 bg-white rounded-xl p-5">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-700">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Delays */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Common CO Delays &amp; How to Avoid Them</h2>
        <div className="space-y-3">
          {COMMON_DELAYS.map((d) => (
            <div key={d.issue} className="border border-orange-200 bg-orange-50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{d.issue}</p>
                  <p className="text-sm text-gray-700 mt-1">{d.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CO Closeout Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">CO Closeout Checklist</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
          {[
            "All trade permits (electrical, plumbing, HVAC, gas) are fully inspected and signed off",
            "As-built drawings submitted to ISD reflecting any field changes",
            "Smoke detectors and CO detectors installed, tested, and compliant",
            "Sprinkler and fire alarm systems commissioned and test reports submitted",
            "Egress lighting and exit signs installed and operational",
            "Accessibility compliance verified (ADA / MAAB) — variance obtained if needed",
            "Site clean: no construction debris, all temp utilities removed",
            "Boston Water & Sewer Commission sign-off obtained (if new connections)",
            "Boston Public Works sign-off obtained (if sidewalk/ROW work done)",
            "Final building inspection passed",
            "Certificate of Occupancy posted at the building entrance",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/permits/boston/building-permit", label: "Boston Building Permit", desc: "ISD requirements, fees, and plan review" },
            { href: "/permits/boston/article-85-demolition", label: "Article 85 Demolition Delay", desc: "18-month delay for structures 50+ years old" },
            { href: "/permits/boston/zba-variance", label: "Boston ZBA Variance Guide", desc: "2026 hearing schedule and process" },
            { href: "/permits/boston/article-80-review", label: "Article 80 Review", desc: "Large project BPDA review (≥50k sq ft)" },
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
            Track Your CO Milestone in MeritLayer
          </h2>
          <p className="text-blue-100 mb-6">
            Upload your inspection sign-offs, track outstanding items, monitor your TCO expiration,
            and get automated alerts before your Certificate of Occupancy deadline.
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
