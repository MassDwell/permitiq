import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  FileText,
  Phone,
  MapPin,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cambridge Special Permit & BZA Guide 2026 | Board of Zoning Appeals | MeritLayer",
  description:
    "Cambridge Board of Zoning Appeals (BZA) special permit guide: 60–90 day process, required documents including site plan and traffic study for 10+ unit projects, community meeting requirements, and fees.",
};

const REQUIRED_DOCS = [
  {
    name: "Completed Special Permit Application",
    detail: "Cambridge BZA application form, available at cambridgema.gov/CDD/zoningboardofappeals. Include all required owner and applicant information. Applications must be submitted to the CDD office at 344 Broadway.",
    critical: true,
  },
  {
    name: "Site Plan (Stamped)",
    detail: "A stamped site plan showing existing conditions, proposed improvements, setbacks, parking, landscaping, and access. Prepared by a licensed Massachusetts architect, engineer, or landscape architect. Scale must be adequate to show all relevant site features.",
    critical: true,
  },
  {
    name: "Architectural Plans",
    detail: "Floor plans and elevations showing the proposed project. Must be stamped by a Massachusetts-licensed architect for structural or significant scope changes. Dimensioned drawings required.",
    critical: true,
  },
  {
    name: "Traffic Study",
    detail: "Required for projects generating more than 10 new dwelling units or significant new commercial traffic. Prepared by a licensed traffic engineer. Cambridge Traffic, Parking & Transportation (TPT) may require a scoping meeting prior to the study.",
    critical: false,
  },
  {
    name: "Community Meeting Documentation",
    detail: "Evidence of a community meeting held prior to filing. Cambridge requires applicants to hold a public meeting with abutters and notify all property owners within 300 feet. Provide meeting notice, sign-in sheet, and a summary of community feedback and your responses.",
    critical: true,
  },
  {
    name: "Abutters List & Certified Mailing Receipts",
    detail: "List of all property owners within 300 feet of the subject property (obtained from the Cambridge Assessor's Office). Certified mailing receipts or return receipts confirming notification.",
    critical: true,
  },
  {
    name: "Zoning Analysis",
    detail: "Written analysis explaining why the project meets the criteria for a special permit under the Cambridge Zoning Ordinance. Cite the specific section(s) being applied under and how each criterion is satisfied.",
    critical: true,
  },
  {
    name: "Filing Fee",
    detail: "Cambridge BZA filing fee paid at time of submission. Fee varies by project size and type — confirm the current schedule with CDD at 617-349-4683.",
    critical: true,
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "Pre-Application Consultation",
    detail: "Cambridge CDD strongly recommends a pre-application meeting before filing. Staff can clarify zoning requirements, identify potential issues, and advise on whether a special permit is actually required. Contact Cambridge CDD at zoning@cambridgema.gov.",
    timeline: "2–4 weeks",
  },
  {
    step: 2,
    name: "Community Meeting",
    detail: "Hold a public community meeting with abutters and neighbors. Notify all property owners within 300 feet via certified mail at least 10 days before the meeting. Document attendance, questions, and responses — Cambridge BZA reviews this closely.",
    timeline: "2–3 weeks",
  },
  {
    step: 3,
    name: "File Application with CDD",
    detail: "Submit the complete application package to Cambridge CDD at 344 Broadway. Pay the filing fee. Staff review for completeness — incomplete applications are returned. Once accepted, your public hearing date is assigned.",
    timeline: "Day 1",
  },
  {
    step: 4,
    name: "Public Hearing",
    detail: "Cambridge BZA holds public hearings on the second and fourth Tuesdays of each month (confirm with CDD for current schedule). Hearings are open to the public. Be prepared to present your project and address board questions. Large or controversial projects may require multiple hearings.",
    timeline: "4–8 weeks after filing",
  },
  {
    step: 5,
    name: "Decision",
    detail: "The Cambridge BZA issues a written decision within 10 days of the hearing. If approved, the decision is recorded with the Middlesex County Registry of Deeds. A 20-day appeal period follows — no building permit may be issued until the appeal period expires.",
    timeline: "2–4 weeks after hearing",
  },
  {
    step: 6,
    name: "Building Permit Application",
    detail: "After the special permit decision is final (appeal period expired or no appeal filed), submit your building permit application to Cambridge ISD with the BZA decision letter included.",
    timeline: "3–6 weeks (ISD review)",
  },
];

const COMMON_REJECTIONS = [
  {
    issue: "Community meeting not held or inadequately documented",
    fix: "Cambridge BZA scrutinizes the community engagement process. Hold the meeting well before filing, document everything carefully, and show how you addressed community concerns. BZA may continue a hearing to require additional outreach.",
  },
  {
    issue: "Traffic study not submitted for projects with 10+ units",
    fix: "Contact Cambridge Traffic, Parking & Transportation early for a scoping meeting. Traffic studies take 4–8 weeks — don't wait until after you file.",
  },
  {
    issue: "Zoning analysis too vague",
    fix: "The BZA requires a specific written analysis tied to the Zoning Ordinance text. Cite each criterion and provide factual support. Vague claims that the project is 'compatible with the neighborhood' will not satisfy the BZA.",
  },
  {
    issue: "Plans change between filing and hearing",
    fix: "Submit revised plans immediately and notify CDD. Significant changes may require refiling or re-noticing abutters.",
  },
  {
    issue: "Missing abutter notification",
    fix: "Obtain the current abutters list from the Cambridge Assessor's Office — do not rely on old lists. Cambridge BZA has delayed or voided approvals due to incomplete notification.",
  },
];

const PRO_TIPS = [
  "Cambridge BZA members care deeply about design quality, neighborhood context, and community engagement. A polished presentation with design renderings goes a long way.",
  "Projects in the Alewife, Kendall Square, or Central Square overlay districts may have additional design review requirements. Check with CDD early.",
  "The Cambridge Historical Commission (CHC) has concurrent jurisdiction over properties in historic districts. CHC review can add 4–8 weeks — schedule it in parallel with BZA preparation.",
  "Cambridge does not allow withdrawal of a special permit application after public notice has been issued, similar to Boston. Understand this before filing.",
  "If denied, Cambridge has a 2-year reapplication waiting period unless circumstances substantially change. Work with CDD staff before refiling.",
  "For projects with affordable housing, the Cambridge Affordable Housing Trust may be a resource — and including affordable units can improve BZA reception.",
];

export default function CambridgeSpecialPermitPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/permits" className="hover:text-blue-600 transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Cambridge</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">Special Permit / BZA</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Cambridge BZA — Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cambridge Special Permit Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          The Cambridge Board of Zoning Appeals (BZA) reviews special permits for projects that
          require relief from the Cambridge Zoning Ordinance. The process is community-driven and
          design-focused — here&apos;s how to navigate it successfully.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            60–90 days typical
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            344 Broadway, Cambridge
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
            <Users className="h-3.5 w-3.5" />
            Community meeting required
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
            <FileText className="h-3.5 w-3.5" />
            Traffic study for 10+ units
          </span>
        </div>
      </div>

      {/* Key Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambridge BZA — Key Contacts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "BZA / CDD Office",
              address: "344 Broadway, Cambridge",
              detail: "Walk-in: Mon–Fri 8:30 AM–5 PM",
              phone: "617-349-4683",
            },
            {
              label: "Zoning Inquiries",
              address: "zoning@cambridgema.gov",
              detail: "Pre-application questions and consultations",
              phone: null,
            },
            {
              label: "Hearing Schedule",
              address: "cambridgema.gov/CDD/zoningboardofappeals",
              detail: "2nd & 4th Tuesdays — confirm with CDD",
              phone: null,
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

      {/* Common Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Issues &amp; How to Avoid Them</h2>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Tips for Cambridge Special Permits</h2>
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
            { href: "/permits/cambridge/building-permit", label: "Cambridge Building Permit", desc: "ISD requirements, green building, 3–6 week timeline" },
            { href: "/permits/boston/zba-variance", label: "Boston ZBA Variance Guide", desc: "Variance and special permit process in Boston" },
            { href: "/permits/massachusetts/adu-permit", label: "Massachusetts ADU Permit", desc: "By-right ADUs under the MBTA Communities Act" },
            { href: "/permits/boston/article-80-review", label: "Boston Article 80 Review", desc: "Large project review for projects ≥50,000 sq ft" },
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
            Upload your BZA application, track hearing dates, monitor community meeting requirements,
            and get automated alerts at every milestone.
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
