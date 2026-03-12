import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  ChevronRight,
  Building2,
  Phone,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boston ADU Permit Guide | MeritLayer",
  description:
    "Complete guide to the Boston ADU building permit process under the 2024 MA ADU Law. Documents checklist, ISD submission steps, fees, timeline, and common rejection reasons.",
};

const REQUIRED_DOCS = [
  {
    label: "Site plan showing ADU location, setbacks, and lot coverage",
    critical: true,
    note: "Must show property lines, existing structures, and proposed ADU footprint",
  },
  {
    label: "Floor plans — existing and proposed",
    critical: true,
    note: "Drawn to scale, with dimensions, labeled rooms, door/window locations",
  },
  {
    label: "Building elevations — all 4 sides",
    critical: true,
    note: "Show exterior materials, window/door placement, finished grade line",
  },
  {
    label: "Foundation plan",
    critical: true,
    note: "Slab, crawlspace, or full basement detail with structural specs",
  },
  {
    label: "Electrical plan (licensed electrician stamp required)",
    critical: true,
    note: "Panel schedule, load calculations, outlet/switch layout — MA licensed electrician",
  },
  {
    label: "Plumbing plan (licensed plumber stamp required)",
    critical: true,
    note: "Water supply, DWV layout, fixture schedule — MA licensed plumber",
  },
  {
    label: "Energy compliance (IECC 2021)",
    critical: true,
    note: "REScheck or COMcheck report — insulation values, window U-factors, HVAC efficiency",
  },
  {
    label: "Deed (proof of ownership)",
    critical: false,
    note: "Recorded deed from Suffolk County Registry of Deeds",
  },
  {
    label: "Title 5 / septic compliance (if applicable)",
    critical: false,
    note: "Required if property is not connected to municipal sewer",
  },
];

const NOT_REQUIRED = [
  "ZBA hearing or variance",
  "Special permit from planning board",
  "Additional parking spaces beyond existing",
  "Owner-occupancy affidavit (removed in 2025 amendment)",
  "Neighborhood notification",
  "BPDA design review (for ADUs under Article 85 threshold)",
];

const SUBMISSION_STEPS = [
  {
    step: "01",
    title: "Pre-Application Zoning Verification",
    time: "1–3 days",
    detail:
      "Confirm your zoning district allows residential use and note required setbacks. Use the Boston Inspectional Services Zoning Map (ISD GIS portal) or call the Zoning Counter at (617) 635-5300. Your ADU must meet side, rear, and front setbacks for your district.",
  },
  {
    step: "02",
    title: "Prepare Complete Application Package",
    time: "1–3 weeks",
    detail:
      "Compile all required documents above. Hire a licensed MA architect or designer for stamped plans. Use a licensed electrician and plumber for trade plans. Run REScheck for energy compliance. Incomplete submissions are the #1 cause of rejection.",
  },
  {
    step: "03",
    title: "Submit Online via Boston Permits Portal",
    time: "Day 1",
    detail:
      "Go to permits.boston.gov and create or log in to your account. Select 'New Application → Residential → Addition/ADU'. Upload all required documents as PDFs. Pay the filing fee by credit card (typically $1,200–$2,400 based on construction cost). You'll receive a permit number immediately.",
  },
  {
    step: "04",
    title: "Plan Review — Boston ISD",
    time: "4–8 weeks",
    detail:
      "ISD will route your plans to zoning, building, electrical, and plumbing reviewers. Each reviewer may issue comments requiring a response. Respond promptly to comments to avoid delays. You can track review status on permits.boston.gov.",
  },
  {
    step: "05",
    title: "Permit Issuance",
    time: "Within 5 business days",
    detail:
      "Once all reviewers approve, you'll receive an email to pay the final permit fee and download your permit. Post the permit conspicuously at the job site before construction begins.",
  },
  {
    step: "06",
    title: "Inspections During Construction",
    time: "Ongoing",
    detail:
      "Schedule inspections through permits.boston.gov: foundation/footing, framing, insulation, rough electrical, rough plumbing, final electrical, final plumbing, and final building. Do not cover work until inspected and approved.",
  },
  {
    step: "07",
    title: "Certificate of Occupancy",
    time: "1–2 weeks post-final",
    detail:
      "After passing all final inspections, request a Certificate of Occupancy. The CO is required before the ADU can be occupied or rented. It confirms the ADU is code-compliant and habitable.",
  },
];

const REJECTION_REASONS = [
  {
    reason: "Incomplete or uncoordinated plans",
    fix: "Ensure all plans are drawn by the same design team, cross-reference plan sheets, and confirm dimensions are consistent across architectural, structural, electrical, and plumbing sets.",
  },
  {
    reason: "Energy compliance documentation missing or incorrect",
    fix: "Run REScheck using the correct climate zone (Boston = Zone 5A). Confirm insulation R-values, window U-factors, and HVAC efficiency meet IECC 2021 minimums. Re-run if you change any specs.",
  },
  {
    reason: "Setback violations not identified",
    fix: "Confirm setback requirements for your specific zoning district BEFORE designing. Show all setbacks on the site plan and confirm the ADU footprint complies with required side, rear, and front yard setbacks.",
  },
  {
    reason: "Unlicensed contractor or expired license",
    fix: "Verify all contractor licenses through the MA Office of Consumer Affairs and Business Regulation (OCABR) at license.reg.state.ma.us. Include license numbers on the application. Check expiration dates.",
  },
  {
    reason: "Structural calculations not PE-stamped",
    fix: "Any structural calculations (beam sizing, point loads, foundation design) must be stamped by a Massachusetts-licensed Professional Engineer (PE). An architect's stamp alone is not sufficient.",
  },
];

const PRO_TIPS = [
  "Submit a complete package on Day 1 — partial submissions reset the review clock",
  "Call ISD pre-application for any non-standard site conditions (tight setbacks, historic district, flood zone)",
  "Use a permit expediter for complex sites — they know reviewers and can resolve comments quickly",
  "Pre-check your energy compliance via REScheck.energy.gov before finalizing design",
  "For modular ADUs (e.g., MassDwell), the factory provides stamped plans — reduces prep significantly",
  "Schedule your first inspection (foundation) before framing crew arrives to avoid idle time",
];

export default function BostonADUPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
        <Link href="/permits" className="hover:text-gray-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/permits" className="hover:text-gray-600 transition-colors">Boston</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600">ADU Permit</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Home className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Boston ISD</p>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Boston ADU Permit Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Complete checklist and step-by-step guide for obtaining a Boston building permit for an
          Accessory Dwelling Unit under the 2024 MA ADU Law (Chapter 150 of the Acts of 2024).
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            4–8 weeks review
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 text-gray-400" />
            $1,200–$2,400 typical fees
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-600">
            <Building2 className="h-4 w-4 text-gray-400" />
            Boston ISD — 1010 Mass Ave
          </div>
        </div>
      </div>

      {/* 2024 Law callout */}
      <div className="mb-10 rounded-2xl p-5 bg-teal-50 border border-teal-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-teal-900 text-sm">By-Right Under the 2024 MA ADU Law</p>
            <p className="text-sm text-teal-700 mt-1">
              Single-family and two-family homeowners in residential zoning districts are now entitled
              to build one ADU by-right — no ZBA hearing, no special permit, no design review required.
              You only need a standard building permit from Boston ISD.
            </p>
            <Link
              href="/tools/adu-eligibility"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 mt-2 transition-colors"
            >
              Check your eligibility first →
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Contacts */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Contacts</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm mb-1">Permit Counter</p>
                <p className="text-xs text-gray-500">1010 Massachusetts Ave, 4th Floor</p>
                <p className="text-xs text-gray-500 mt-0.5">Mon–Fri 8:00am – 4:00pm</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-blue-600">(617) 635-5300</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm mb-1">Online Portal</p>
                <p className="text-xs text-gray-500">Submit permits and track status online</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-blue-600">permits.boston.gov</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm mb-1">Zoning Counter</p>
                <p className="text-xs text-gray-500">Confirm district + setbacks pre-app</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-blue-600">(617) 635-5300 ext. 2</p>
                </div>
              </div>
            </div>
          </section>

          {/* Required Documents */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Required Documents Checklist</h2>
            <p className="text-sm text-gray-500 mb-4">All items required unless marked optional</p>
            <div className="space-y-2">
              {REQUIRED_DOCS.map((doc) => (
                <div
                  key={doc.label}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${doc.critical ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${doc.critical ? "border-gray-400" : "border-gray-300"}`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${doc.critical ? "text-gray-900" : "text-gray-600"}`}>
                      {doc.label}
                      {!doc.critical && (
                        <span className="ml-2 text-xs font-normal text-gray-400">(may be required)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NOT Required */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              What&apos;s NOT Required
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Thanks to the 2024 MA ADU Law — these requirements no longer apply for by-right ADUs.
            </p>
            <div className="space-y-2">
              {NOT_REQUIRED.map((item) => (
                <div key={item} className="flex items-center gap-3 p-3.5 border border-green-100 bg-green-50 rounded-xl">
                  <XCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-800">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Submission steps */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Boston ISD Submission Process</h2>
            <div className="space-y-4">
              {SUBMISSION_STEPS.map((s) => (
                <div key={s.step} className="flex gap-4 p-5 border border-gray-200 rounded-xl">
                  <div className="flex-shrink-0">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{ background: "rgba(20,184,166,0.1)", color: "#14B8A6" }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {s.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Common rejections */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Common Rejection Reasons</h2>
            <p className="text-sm text-gray-500 mb-4">Top 5 reasons permits are rejected — and how to fix them</p>
            <div className="space-y-3">
              {REJECTION_REASONS.map((item, i) => (
                <div key={i} className="p-5 border border-orange-100 bg-orange-50 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-gray-900 text-sm">{item.reason}</p>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    <span className="font-medium text-green-700">Fix: </span>{item.fix}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pro tips */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pro Tips</h2>
            <div className="space-y-2">
              {PRO_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Fee schedule */}
          <div className="p-5 border border-gray-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Boston ISD Fee Schedule</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Construction Cost</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { range: "Up to $1,000", fee: "$25 min" },
                  { range: "$1,001 – $10,000", fee: "$25 + $9/$1k" },
                  { range: "$10,001 – $100,000", fee: "$106 + $7/$1k" },
                  { range: "$100,001 – $500,000", fee: "$737 + $6/$1k" },
                  { range: "Over $500,000", fee: "Formula-based" },
                ].map((row) => (
                  <tr key={row.range}>
                    <td className="py-1.5 text-gray-600">{row.range}</td>
                    <td className="py-1.5 text-right text-gray-900 font-medium">{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">
              Fees are approximate. Confirm current rates at permits.boston.gov.
            </p>
          </div>

          {/* ADU Eligibility CTA */}
          <div
            className="p-5 rounded-2xl text-white"
            style={{
              background: "linear-gradient(135deg, #0f2027 0%, #0d2233 50%, #0f2638 100%)",
              border: "1px solid rgba(20,184,166,0.25)",
            }}
          >
            <Home className="h-5 w-5 mb-2" style={{ color: "#14B8A6" }} />
            <p className="font-semibold text-sm mb-1">Check Your Eligibility</p>
            <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
              Find out if your property qualifies for a by-right ADU under the 2024 MA law.
            </p>
            <Link
              href="/tools/adu-eligibility"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "#14B8A6", color: "#080D1A" }}
            >
              ADU Eligibility Checker →
            </Link>
          </div>

          {/* MassDwell CTA */}
          <div className="p-5 border border-gray-200 rounded-2xl">
            <p className="font-semibold text-gray-900 text-sm mb-1">Ready to Build?</p>
            <p className="text-xs text-gray-500 mb-3">
              MassDwell factory-built ADUs come with stamped plans, turnkey permitting, and start at $141K.
            </p>
            <a
              href="https://massdwell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "#14B8A6", color: "#ffffff" }}
            >
              Get a Free Quote →
            </a>
          </div>

          {/* Related guides */}
          <div className="p-5 border border-gray-200 rounded-2xl">
            <p className="font-semibold text-gray-900 text-sm mb-3">Related Guides</p>
            <div className="space-y-2">
              {[
                { href: "/permits/boston/building-permit", label: "Boston Building Permit Guide", icon: FileText },
                { href: "/permits/boston/certificate-of-occupancy", label: "Certificate of Occupancy", icon: CheckCircle },
                { href: "/tools/zoning-lookup", label: "Boston Zoning Lookup", icon: Building2 },
              ].map((g) => {
                const Icon = g.icon;
                return (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{g.label}</p>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 ml-auto flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* CTA */}
      <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Track your ADU permit progress</h2>
        <p className="text-blue-100 mb-6">
          MeritLayer tracks permit status, deadlines, and compliance across all your Massachusetts
          projects — with AI-powered document processing and proactive alerts.
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
