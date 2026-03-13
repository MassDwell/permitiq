import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Leaf,
  Users,
  Truck,
  Landmark,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boston Article 80 Development Review Guide 2026 | MeritLayer",
  description:
    "Complete guide to Boston Article 80 development review: Large Project Review (≥50,000 sq ft) and Small Project Review (≥20,000 sq ft or 15 units). 5-step LOI→PNF→DPIR→FPIR→Adequacy Determination process, 12-24 month timeline, and July 2025 modernization update.",
};

const LARGE_PROJECT_STEPS = [
  {
    step: 1,
    name: "Letter of Intent (LOI)",
    detail:
      "Developer files a LOI with the Boston Planning Department describing the project scope, site, proposed uses, and expected impacts. The LOI opens the formal Article 80 review process and triggers BPDA project manager assignment.",
    duration: "2–4 weeks",
    tips: "Be thorough but concise. Expect the project manager to request clarifications before moving to PNF.",
  },
  {
    step: 2,
    name: "Project Notification Form (PNF)",
    detail:
      "Developer files the PNF — a detailed description including site plans, architectural renderings, environmental assessments, transportation studies, and community benefits analysis. The PNF opens for public comment (30-day period). Adjacent neighbors and city agencies receive notification.",
    duration: "60–90 days",
    tips: "Engage community groups before the PNF is filed. Pre-emptive outreach significantly reduces public comment challenges.",
  },
  {
    step: 3,
    name: "Draft Project Impact Report (DPIR)",
    detail:
      "If required by BPDA, developer submits a DPIR analyzing impacts in detail: transportation, wind/shadow, noise, air quality, historic resources, and more. The DPIR triggers another public comment period. BPDA and city agencies provide written responses.",
    duration: "3–6 months",
    tips: "Not all projects require a DPIR. Projects with straightforward impacts may move directly from PNF to Adequacy Determination.",
  },
  {
    step: 4,
    name: "Final Project Impact Report (FPIR)",
    detail:
      "If DPIR public comment raises unresolved issues, developer files a FPIR addressing outstanding concerns from DPIR. This step ensures all community and agency feedback has been addressed before the final board vote.",
    duration: "2–4 months",
    tips: "Proactive community engagement during DPIR reduces the likelihood of a prolonged FPIR process.",
  },
  {
    step: 5,
    name: "Adequacy Determination",
    detail:
      "BPDA Board votes to: approve the project as submitted, not approve it, or approve with conditions. Conditions may include affordable housing contributions, transportation improvements, open space requirements, or design modifications.",
    duration: "4–8 weeks after FPIR",
    tips: "Approval with conditions is the most common outcome for large projects. Negotiate conditions proactively before the board vote.",
  },
];

const LARGE_REVIEW_AREAS = [
  { icon: Truck, label: "Transportation Impacts", detail: "Traffic, pedestrian, and transit analysis" },
  { icon: Leaf, label: "LEED & Climate Resilience", detail: "Green building + climate change mitigation" },
  { icon: Users, label: "Affordable Housing", detail: "Inclusionary development policy compliance" },
  { icon: Landmark, label: "Historic Resources", detail: "Impact on designated historic areas" },
  { icon: Building2, label: "Urban Design", detail: "Streetscape, massing, and public realm" },
  { icon: AlertTriangle, label: "Environmental", detail: "Wind, shadow, noise, air quality, solar glare" },
];

const SMALL_REVIEW_AREAS = [
  "Urban design principles consistency",
  "Site plan review",
  "Signage in non-residential districts",
  "Climate resilience",
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Article 80 in Boston?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Article 80 of the Boston Zoning Code governs development review for large and small projects. Originally adopted in 1996, it requires developers to analyze and mitigate the impacts of significant new construction on Boston's built environment.",
      },
    },
    {
      "@type": "Question",
      name: "When is Boston Article 80 Large Project Review required?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Large Project Review is required for projects adding 50,000 square feet or more of gross floor area, projects near Boston Harbor, and large projects with a significant change of use without new construction.",
      },
    },
    {
      "@type": "Question",
      name: "How long does Article 80 review take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Article 80 Large Project Review typically takes 12–24 months from LOI filing to Adequacy Determination. Small Project Review is faster, typically 3–6 months.",
      },
    },
    {
      "@type": "Question",
      name: "What changed in the July 2025 Article 80 modernization?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In July 2025, Boston voted the most substantive set of changes to Article 80 since its adoption in 1996. The updates were aimed at making the development review process more predictable, transparent, and streamlined for developers.",
      },
    },
  ],
};

export default function Article80ReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#080D1A', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
          <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Boston</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-white">Article 80 Review</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-[#14B8A6]" />
            <span className="text-sm font-medium text-[#14B8A6]">Boston Developer Guide</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Boston Article 80 Development Review
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-3xl">
            Article 80 of Boston&apos;s Zoning Code governs development review for large and small
            projects. If your project adds 50,000+ sq ft or 20,000+ sq ft (or 15+ units), you must
            complete Article 80 review before breaking ground.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-900/20 text-amber-400 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Large Review: 12–24 months
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
              <FileText className="h-3.5 w-3.5" />
              LOI → PNF → DPIR → FPIR → Adequacy
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" />
              July 2025 Modernization Update
            </span>
          </div>
        </div>

        {/* July 2025 Update Banner */}
        <div className="mb-10 bg-green-900/20 border border-green-700/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">July 2025 — Article 80 Modernization</p>
              <p className="text-sm text-[#94A3B8] mt-1">
                Boston voted the most substantive changes to Article 80 since its adoption in 1996.
                The updates aim to make the development review process <strong>more predictable,
                transparent, and streamlined</strong> for developers. Review the BPDA&apos;s updated
                guidance before filing your LOI.
              </p>
              <a
                href="http://www.bostonplans.org/projects/development-review/what-is-article-80"
                className="inline-flex items-center gap-1 text-sm text-green-400 font-medium hover:underline mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                BPDA Article 80 Overview <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* When Does Article 80 Apply */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">When Does Article 80 Apply?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border-2 border-[rgba(20,184,166,0.25)] bg-[rgba(20,184,166,0.08)] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#14B8A6] text-white text-xs font-bold px-2.5 py-1 rounded-full">LARGE</span>
                <p className="font-semibold text-white">Large Project Review</p>
              </div>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                  Adding ≥50,000 sq ft gross floor area
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                  Projects near Boston Harbor
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                  Large projects with significant change of use (without new construction)
                </li>
              </ul>
              <div className="mt-4 bg-[#0D1525] rounded-xl p-3 border border-[rgba(20,184,166,0.25)]">
                <p className="text-xs font-semibold text-[#14B8A6]">Typical Timeline</p>
                <p className="text-lg font-bold text-white">12–24 months</p>
              </div>
            </div>
            <div className="border-2 border-white/10 bg-[#111827] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">SMALL</span>
                <p className="font-semibold text-white">Small Project Review</p>
              </div>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#64748B] mt-0.5 flex-shrink-0" />
                  Adding ≥20,000 sq ft gross floor area
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#64748B] mt-0.5 flex-shrink-0" />
                  Adding ≥15 dwelling units
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-[#64748B] mt-0.5 flex-shrink-0" />
                  Below 50,000 sq ft threshold
                </li>
              </ul>
              <div className="mt-4 bg-[#0D1525] rounded-xl p-3 border border-white/10">
                <p className="text-xs font-semibold text-[#94A3B8]">Typical Timeline</p>
                <p className="text-lg font-bold text-white">3–6 months</p>
              </div>
            </div>
          </div>
        </section>

        {/* Large Project Review — 5-Step Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Large Project Review: 5-Step Process</h2>
          <p className="text-[#94A3B8] mb-6">
            The full Article 80 Large Project Review follows a defined sequence from initial filing
            through BPDA Board approval. Each step includes public comment periods.
          </p>
          <div className="space-y-6">
            {LARGE_PROJECT_STEPS.map((step) => (
              <div key={step.step} className="border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 bg-[#111827] border-b border-white/10 px-6 py-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{step.name}</p>
                  </div>
                  <span className="text-xs font-medium bg-[#0D1525] border border-white/10 text-[#94A3B8] px-3 py-1.5 rounded-full flex-shrink-0">
                    {step.duration}
                  </span>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <p className="text-[#94A3B8]">{step.detail}</p>
                  <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-300"><strong>Developer Tip:</strong> {step.tips}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            What the Board Reviews (Large Projects)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LARGE_REVIEW_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.label} className="border border-white/10 rounded-xl p-4">
                  <Icon className="h-5 w-5 text-[#14B8A6] mb-2" />
                  <p className="font-semibold text-white text-sm">{area.label}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{area.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Small Project Review */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Small Project Review</h2>
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <p className="text-[#94A3B8] mb-4">
              Projects between 20,000–50,000 sq ft (or ≥15 dwelling units) undergo a streamlined
              review focused on:
            </p>
            <ul className="space-y-2">
              {SMALL_REVIEW_AREAS.map((area) => (
                <li key={area} className="flex items-center gap-2 text-[#94A3B8]">
                  <CheckCircle className="h-4 w-4 text-[#64748B] flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#64748B] mt-4">
              You will typically be notified by ISD or your assigned Planning Department project
              manager if Small Project Review is required.
            </p>
          </div>
        </section>

        {/* Timeline Reality Check */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Timeline Reality Check</h2>
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white text-lg">
                  Article 80 Large Project Review typically takes 12–24 months.
                </p>
                <p className="text-[#94A3B8] mt-2">
                  This timeline reflects the full process from LOI filing to Adequacy Determination.
                  Complex projects with significant community opposition or environmental concerns
                  can exceed 24 months. Projects that proactively engage community groups and city
                  agencies before filing often move through the process faster.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-[#94A3B8]">
                  <li className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-[#64748B] uppercase tracking-wide flex-shrink-0">LOI → PNF</span>
                    <span>4–8 weeks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-[#64748B] uppercase tracking-wide flex-shrink-0">PNF Review</span>
                    <span>2–4 months (incl. 30-day public comment)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-[#64748B] uppercase tracking-wide flex-shrink-0">DPIR (if req.)</span>
                    <span>3–6 months</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-[#64748B] uppercase tracking-wide flex-shrink-0">FPIR (if req.)</span>
                    <span>2–4 months</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-[#64748B] uppercase tracking-wide flex-shrink-0">Board Vote</span>
                    <span>4–8 weeks after final submission</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Contact Boston Planning Department</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-xl p-5">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Article 80 Inquiries</p>
              <a href="mailto:article80inquiries@boston.gov" className="font-semibold text-[#14B8A6] hover:underline">
                article80inquiries@boston.gov
              </a>
              <p className="text-sm text-[#64748B] mt-1">For project-specific questions before filing LOI</p>
            </div>
            <div className="border border-white/10 rounded-xl p-5">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">BPDA Development Review</p>
              <a
                href="http://www.bostonplans.org/projects/development-review/what-is-article-80"
                className="font-semibold text-[#14B8A6] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                bostonplans.org
              </a>
              <p className="text-sm text-[#64748B] mt-1">Full Article 80 guidance, templates, and active projects</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)", border: "1px solid rgba(20,184,166,0.25)" }}>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Track Article 80 Milestones in MeritLayer
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Monitor LOI, PNF, DPIR, and FPIR deadlines across all your Boston development
              projects. MeritLayer sends automated alerts before each Article 80 milestone so
              nothing slips through the cracks.
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
    </>
  );
}
