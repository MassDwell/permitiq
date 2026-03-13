import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boston ZBA Variance Guide 2026 | Fees, Schedule & Process | MeritLayer",
  description:
    "Complete Boston Zoning Board of Appeal guide for developers: 2026 hearing schedule, fee breakdown ($150 flat or per violation), 5-step process, 45-day filing window, and 1-year wait rule.",
};

const ZBA_2026_HEARINGS = [
  { date: "January 6", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "January 20", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "February 3", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "February 17", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "March 3", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "March 17", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "March 31", dayOfWeek: "Tuesday", quarter: "Q1" },
  { date: "April 14", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "April 28", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "May 12", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "May 26", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "June 9", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "June 23", dayOfWeek: "Tuesday", quarter: "Q2" },
  { date: "July 7", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "July 21", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "August 4", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "August 18", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "September 1", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "September 15", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "September 29", dayOfWeek: "Tuesday", quarter: "Q3" },
  { date: "October 13", dayOfWeek: "Tuesday", quarter: "Q4" },
  { date: "October 27", dayOfWeek: "Tuesday", quarter: "Q4" },
  { date: "November 10", dayOfWeek: "Tuesday", quarter: "Q4" },
  { date: "November 24", dayOfWeek: "Tuesday", quarter: "Q4" },
  { date: "December 8", dayOfWeek: "Tuesday", quarter: "Q4" },
  { date: "December 22", dayOfWeek: "Tuesday", quarter: "Q4" },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "File Your Appeal",
    detail:
      "File within 45 days of your denial letter. Submit online at the Boston ISD portal or in person at 1010 Mass Ave, 5th Floor. Include the denial letter, project plans, and a written explanation of your requested relief.",
    timeline: "Day 1–45",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board",
  },
  {
    step: 2,
    name: "Pay Filing Fee",
    detail:
      "Residential ≤3 units: $150 flat fee. All other buildings and residential >3 units: $150 per City or state zoning violation cited in the denial. Count your violations before filing — each one adds $150.",
    timeline: "At filing",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board",
  },
  {
    step: 3,
    name: "Hearing Date Set & Notices Sent",
    detail:
      "The ZBA sets your hearing date on the next available docket (every other Tuesday). Public notice is published in the Boston Globe and Boston Herald at least 20 days in advance. All abutters and adjacent owners receive mailed notice.",
    timeline: "20+ days before hearing",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board",
  },
  {
    step: 4,
    name: "Public Hearing at City Hall",
    detail:
      "Attend in person at 1 City Hall Square, Room 801. Bring your architect, engineer, or attorney. Present your project and respond to any community concerns. The board may ask questions or request additional materials.",
    timeline: "Hearing day",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board",
  },
  {
    step: 5,
    name: "Receive Decision",
    detail:
      "Formal written decision arrives approximately 15 days after the hearing. The Boston Planning Department (BPD) may also need to conduct a separate review. Decisions may include conditions and requirements attached to any approval.",
    timeline: "~15 days post-hearing",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board",
  },
];

const KEY_RULES = [
  {
    icon: Clock,
    title: "45-Day Filing Window",
    detail:
      "You must file your ZBA appeal within 45 calendar days of your denial letter from ISD. Missing this window means starting over with a new permit application.",
    severity: "critical",
  },
  {
    icon: AlertTriangle,
    title: "1-Year Wait After Denial",
    detail:
      "If the ZBA denies your appeal, you cannot re-apply for the same or substantially similar project for one full year — unless you make substantial changes to the plans or the denial was 'without prejudice.'",
    severity: "critical",
  },
  {
    icon: AlertTriangle,
    title: "Cannot Withdraw After Notice",
    detail:
      "Once public notices have been sent to abutters and published in the newspapers, you cannot simply withdraw your appeal. You may request a dismissal 'without prejudice' before the board conducts its review.",
    severity: "warning",
  },
  {
    icon: Scale,
    title: "Fee Counts Each Violation",
    detail:
      "For projects with multiple zoning violations, the $150 per-violation fee adds up fast. A project needing setback, height, and FAR variances simultaneously could cost $450+ in filing fees alone.",
    severity: "info",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to File a Boston ZBA Appeal or Variance",
  description:
    "Step-by-step process for filing a Zoning Board of Appeal variance or special permit in Boston, Massachusetts.",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    minValue: "150",
    maxValue: "600",
  },
  step: PROCESS_STEPS.map((s) => ({
    "@type": "HowToStep",
    position: s.step,
    name: s.name,
    text: s.detail,
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does it cost to file a Boston ZBA appeal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For residential buildings with 3 or fewer units: $150 flat fee. For all other buildings and residential buildings with more than 3 units: $150 per zoning violation cited in the denial letter. A project with 3 violations would cost $450 in filing fees.",
      },
    },
    {
      "@type": "Question",
      name: "How long do I have to file a ZBA appeal in Boston?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You must file your ZBA appeal within 45 calendar days of receiving your denial letter from Boston's Inspectional Services Department (ISD). Missing this window requires starting a new permit application from scratch.",
      },
    },
    {
      "@type": "Question",
      name: "When does the Boston ZBA meet in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Boston Zoning Board of Appeal holds public hearings every other Tuesday at 9:30 AM at 1 City Hall Square, Room 801. In 2026, hearings run bi-weekly from January through December.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if the Boston ZBA denies my appeal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If the ZBA denies your appeal, you cannot re-apply for the same or substantially similar project for one full year — unless you make substantial changes to the plans or the denial was issued 'without prejudice.' A formal written decision typically arrives approximately 15 days after the hearing.",
      },
    },
    {
      "@type": "Question",
      name: "Can I withdraw a Boston ZBA appeal after filing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Once public notices have been sent to abutters and published in the Boston Globe and Boston Herald, you cannot simply withdraw your appeal. You may request a dismissal 'without prejudice' before the board conducts its formal review.",
      },
    },
  ],
};

const quarterGroups = ZBA_2026_HEARINGS.reduce<Record<string, typeof ZBA_2026_HEARINGS>>(
  (acc, h) => {
    if (!acc[h.quarter]) acc[h.quarter] = [];
    acc[h.quarter].push(h);
    return acc;
  },
  {}
);

export default function ZbaVariancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
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
          <span className="text-white">ZBA Variance</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-5 w-5 text-[#14B8A6]" />
            <span className="text-sm font-medium text-[#14B8A6]">Boston Developer Guide</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Boston ZBA Variance Guide
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-3xl">
            The Zoning Board of Appeal (ZBA) hears cases where a project doesn&apos;t meet Boston&apos;s
            zoning code — including variances, special permits, and appeals of ISD decisions. This
            guide covers the 2026 hearing schedule, fee breakdown, and the full 5-step process.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
              <DollarSign className="h-3.5 w-3.5" />
              $150 flat (≤3 units) or $150/violation
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#111827] text-[#94A3B8] px-3 py-1.5 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              Every other Tuesday 9:30 AM
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-900/20 text-amber-400 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              File within 45 days of denial
            </span>
          </div>
        </div>

        {/* What is the ZBA */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">What Is the ZBA?</h2>
          <div className="bg-[#111827] rounded-2xl p-6 text-[#94A3B8] space-y-3">
            <p>
              The Boston Zoning Board of Appeal is a seven-member board appointed by the Mayor, each
              serving 3-year terms. It reviews appeals when ISD denies a permit because a project
              doesn&apos;t comply with the zoning code.
            </p>
            <p>
              <strong className="text-white">You need the ZBA when:</strong> your project requires
              a variance (e.g., setback, height, FAR, parking), a special permit (e.g., certain use
              changes), or when you want to challenge an ISD decision.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0D1525] border border-white/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Hearings</p>
                <p className="font-semibold text-white">1 City Hall Square, Room 801</p>
                <p className="text-sm text-[#94A3B8]">Every other Tuesday, 9:30 AM</p>
              </div>
              <div className="bg-[#0D1525] border border-white/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">File Appeal</p>
                <p className="font-semibold text-white">1010 Mass Ave, 5th Floor</p>
                <p className="text-sm text-[#94A3B8]">617-635-5300 / 617-635-5399</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Rules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Critical Rules for Developers</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {KEY_RULES.map((rule) => {
              const Icon = rule.icon;
              const bgClass =
                rule.severity === "critical"
                  ? "bg-red-900/20 border-red-700/30"
                  : rule.severity === "warning"
                  ? "bg-amber-900/20 border-amber-700/30"
                  : "bg-[rgba(20,184,166,0.08)] border-[rgba(20,184,166,0.25)]";
              const iconClass =
                rule.severity === "critical"
                  ? "text-red-500"
                  : rule.severity === "warning"
                  ? "text-amber-400"
                  : "text-[#14B8A6]";
              return (
                <div key={rule.title} className={`border rounded-xl p-5 ${bgClass}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconClass}`} />
                    <div>
                      <p className="font-semibold text-white mb-1">{rule.title}</p>
                      <p className="text-sm text-[#94A3B8]">{rule.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fees */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Fee Schedule</h2>
          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#111827] border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Project Type</th>
                  <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Fee</th>
                  <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide px-6 py-3">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                <tr>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">Residential, ≤3 units</p>
                    <p className="text-sm text-[#64748B]">1–3 family homes</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white">$150 flat</span>
                    <p className="text-xs text-[#64748B]">Regardless of # of violations</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">
                    A 2-family requesting a setback variance → $150
                  </td>
                </tr>
                <tr className="bg-[#111827]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">All other buildings</p>
                    <p className="text-sm text-[#64748B]">Residential &gt;3 units, commercial, mixed-use</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white">$150 per violation</span>
                    <p className="text-xs text-[#64748B]">Each City or state code violation cited</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">
                    10-unit with 3 violations → $450
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[#64748B] mt-3">
            Source:{" "}
            <a
              href="https://www.boston.gov/departments/inspectional-services/how-file-appeal-zoning-board"
              className="text-[#14B8A6] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Boston ISD — How to File a ZBA Appeal
            </a>
          </p>
        </section>

        {/* 5-Step Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">5-Step ZBA Process</h2>
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
                  <p className="text-[#94A3B8] mt-1">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[rgba(20,184,166,0.08)] border border-[rgba(20,184,166,0.25)] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Typical Total Timeline</p>
                <p className="text-sm text-[#94A3B8] mt-1">
                  From filing to decision: <strong>8–16 weeks</strong>, depending on when the next
                  available hearing date falls. Plan for 2–4 months of review time in your project
                  schedule before banking on ZBA approval.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2026 Hearing Schedule */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">2026 ZBA Hearing Schedule</h2>
          <p className="text-[#94A3B8] mb-6">
            Full hearing schedule — every other Tuesday at 9:30 AM, City Hall Room 801. Advisory
            subcommittee meets every other Thursday.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(quarterGroups).map(([quarter, hearings]) => (
              <div key={quarter} className="border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-[#111827] px-4 py-2.5 border-b border-white/10">
                  <p className="font-semibold text-[#94A3B8] text-sm">{quarter} 2026</p>
                </div>
                <div className="divide-y divide-white/6">
                  {hearings.map((h) => (
                    <div key={h.date} className="px-4 py-2.5 flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-[#94A3B8]">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748B] mt-3">
            Schedule based on Boston ZBA&apos;s standard every-other-Tuesday pattern. Confirm dates at{" "}
            <a
              href="https://www.boston.gov/departments/inspectional-services"
              className="text-[#14B8A6] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              boston.gov/departments/inspectional-services
            </a>
            .
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)", border: "1px solid rgba(20,184,166,0.25)" }}>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Track Your ZBA Application in MeritLayer
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Upload your denial letter, track the 45-day filing deadline, monitor your hearing date,
              and get automated alerts before each ZBA milestone — all in one compliance dashboard.
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
