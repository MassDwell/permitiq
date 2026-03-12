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
  Leaf,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cambridge Building Permit Guide 2026 | ISD Requirements & Fees | MeritLayer",
  description:
    "Complete Cambridge ISD building permit guide: required documents, green building requirements, energy compliance, fees ($12/sqft commercial, $8/sqft residential), 3–6 week timeline, and LEED requirements.",
};

const REQUIRED_DOCS = [
  {
    name: "Stamped Architectural Plans",
    detail: "Full set of architectural drawings stamped by a Massachusetts-licensed architect. Cambridge ISD requires two sets: site plan, floor plans, elevations, sections, and a life-safety plan. Complex projects may require additional coordination drawings.",
    critical: true,
  },
  {
    name: "Structural Calculations (PE-Stamped)",
    detail: "PE-stamped structural calculations for any new construction, additions, or structural modifications. Required for all work affecting load-bearing elements, foundations, or the roof structure.",
    critical: true,
  },
  {
    name: "Energy Compliance Documentation",
    detail: "Massachusetts Energy Code compliance documentation (REScheck for residential, COMcheck for commercial). Cambridge additionally requires the Stretch Energy Code for most new construction — confirm with ISD at intake.",
    critical: true,
  },
  {
    name: "Green Building Compliance",
    detail: "Cambridge's Green Building Requirement: new commercial buildings ≥25,000 sq ft must achieve LEED Silver or equivalent (Cambridge Green Building Ordinance, Chapter 8.72). Provide LEED registration confirmation or equivalent documentation. Residential projects in Cambridge may also be subject to BERDO.",
    critical: true,
  },
  {
    name: "Recorded Deed / Proof of Ownership",
    detail: "Copy of the current recorded deed. Contractor applications require an owner authorization letter.",
    critical: false,
  },
  {
    name: "Property Survey / Plot Plan",
    detail: "Certified survey or plot plan showing property lines, setbacks, and existing conditions. Required for new construction by a licensed Massachusetts land surveyor.",
    critical: false,
  },
  {
    name: "Contractor Credentials",
    detail: "Massachusetts Construction Supervisor License (CSL) for structural work. HIC license for residential projects over $1,000. Certificate of liability insurance naming the City of Cambridge as additional insured.",
    critical: true,
  },
  {
    name: "Zoning Board Approval (if required)",
    detail: "If the project requires a special permit from the Cambridge Board of Zoning Appeals, that approval must be obtained before ISD issues a building permit. Include the BZA decision letter.",
    critical: false,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Zoning & Green Building Pre-Check",
    detail: "Verify compliance with Cambridge's Zoning Ordinance (available at cambridgema.gov/CDD). Confirm whether the project triggers Cambridge's Green Building Requirement (≥25,000 sq ft commercial). If a special permit is required, file with the BZA before proceeding.",
    timeline: "1–2 weeks",
  },
  {
    step: 2,
    name: "Prepare Application Package",
    detail: "Coordinate architectural, structural, and energy documentation. For projects subject to LEED requirements, confirm registration with the USGBC and include registration proof. Ensure REScheck/COMcheck matches the submitted plans exactly.",
    timeline: "Varies",
  },
  {
    step: 3,
    name: "Submit to Cambridge ISD",
    detail: "Submit online via cambridgema.gov/CDD/permitting or in person at 831 Massachusetts Ave. Pay the application fee at submission. Cambridge ISD accepts online applications for most permit types — confirm format requirements at intake.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Plan Review",
    detail: "Cambridge ISD reviews plans for Massachusetts State Building Code (9th Edition), energy code, accessibility, and zoning compliance. Residential: approximately 3–4 weeks. Commercial and mixed-use: 4–6 weeks. Deficiency letters (correction notices) must be responded to within 30 days.",
    timeline: "3–6 weeks typical",
  },
  {
    step: 5,
    name: "Permit Issuance",
    detail: "Once approved, pay the full permit fee. Post the permit on-site in a visible location. Keep approved plans on-site at all times. Cambridge may require a pre-construction meeting for larger projects.",
    timeline: "Within 5 business days of approval",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Green building documentation missing for large commercial projects",
    fix: "For projects ≥25,000 sq ft, include LEED registration confirmation or an equivalent certification plan at submission. Cambridge ISD will not issue a building permit without it.",
  },
  {
    issue: "Stretch Energy Code non-compliance",
    fix: "Cambridge enforces the Stretch Energy Code for new residential and commercial construction. Standard REScheck/COMcheck may not be sufficient — confirm with ISD whether Stretch applies to your project type.",
  },
  {
    issue: "Zoning setback or FAR violation",
    fix: "Cambridge's zoning has numerous district-specific rules. Use the Cambridge GIS portal to verify your project's zoning district and confirm setbacks, FAR, and height limits before submitting.",
  },
  {
    issue: "Incomplete coordination between architect and structural engineer",
    fix: "Cambridge ISD commonly returns plans when the structural drawings don't match the architectural set. Have your engineer of record coordinate and sign off before submission.",
  },
  {
    issue: "Missing contractor license documentation",
    fix: "Verify your CSL and HIC licenses are active on the OCABR website. All listed subcontractors' licenses must be current at the time of submission.",
  },
];

const PRO_TIPS = [
  "Cambridge ISD offers a pre-application consultation for complex projects — especially valuable for mixed-use or historic properties.",
  "The Cambridge Green Building Requirement applies to renovations as well as new construction for buildings ≥25,000 sq ft. Check your scope carefully.",
  "Cambridge's Affordable Housing Overlay (AHO) allows higher-density housing by-right in many districts — review your zoning district before assuming a BZA filing is required.",
  "Trade permits (electrical, plumbing, mechanical) are separate applications. Submit them after the building permit is in review to avoid delays.",
  "Cambridge has a historic district overlay for parts of East Cambridge and Mid-Cambridge. If your property is in a historic district, the Cambridge Historical Commission (CHC) review adds 4–8 weeks.",
  "If you receive a deficiency letter, respond within 30 days. After 90 days without a response, Cambridge ISD may close the application.",
];

export default function CambridgeBuildingPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Cambridge</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">Building Permit</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Cambridge ISD — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cambridge Building Permit Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The Cambridge Inspectional Services Department (ISD) issues building permits for all
          construction, renovation, and demolition work in Cambridge. Cambridge has its own green
          building requirements and enforces the Stretch Energy Code — here&apos;s what developers
          need to know.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            3–6 weeks typical review
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            831 Massachusetts Ave, Cambridge
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            <DollarSign className="h-3.5 w-3.5" />
            $12/sqft commercial · $8/sqft residential
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
            <Leaf className="h-3.5 w-3.5" />
            LEED/Green Building required ≥25k sqft
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambridge ISD — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Permit Counter",
              address: "831 Massachusetts Ave, 2nd Floor",
              detail: "Walk-in: Mon–Fri 8 AM–4 PM (closed Wed afternoon)",
              phone: "617-349-6100",
            },
            {
              label: "Online Portal",
              address: "cambridgema.gov/CDD/permitting",
              detail: "Apply online, track status, pay fees",
              phone: null,
            },
            {
              label: "Green Building Program",
              address: "Cambridge CDD — Environment & Transportation",
              detail: "LEED and Cambridge Green Building requirements",
              phone: "617-349-4600",
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Project Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Commercial (new construction / addition)", "$12 per square foot"],
                ["Residential (new construction / addition)", "$8 per square foot"],
                ["Interior renovation (commercial)", "$8 per square foot"],
                ["Interior renovation (residential)", "$5 per square foot"],
                ["Minimum permit fee", "$100"],
              ].map(([type, fee]) => (
                <tr key={type}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{type}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          Fee schedule simplified for illustration. Cambridge ISD calculates fees based on gross floor area. Trade permits (electrical, plumbing, HVAC) are separate applications billed independently.
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips for Cambridge Developers</h2>
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
            { href: "/permits/cambridge/special-permit", label: "Cambridge Special Permit / BZA", desc: "Board of Zoning Appeals process, 60–90 day timeline" },
            { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", desc: "ISD requirements for projects in Boston" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit", desc: "By-right ADUs under the MBTA Communities Act" },
            { href: "/permits/boston/article-80-review", label: "Boston Article 80 Review", desc: "Large project review for ≥50,000 sq ft" },
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
            Track Your Cambridge Permit in MeritLayer
          </h2>
          <p className="text-blue-100 mb-6">
            Upload your Cambridge permit application, track ISD review milestones, monitor green
            building compliance, and get automated deadline alerts across all your projects.
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
