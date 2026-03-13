import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Building2,
  Shield,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boston Article 85 Demolition Delay Guide | MeritLayer",
  description:
    "Complete guide to Boston's Article 85 Demolition Delay ordinance: what triggers the 18-month clock, exemptions, BPDA review process, and how to navigate it for structures over 50 years old.",
};

const TRIGGERS = [
  {
    trigger: "Structure is 50+ years old",
    detail: "Article 85 applies to any structure that is 50 or more years old at the time the demolition permit is filed. The age is calculated from the date of original construction, not from any renovations.",
    applies: true,
  },
  {
    trigger: "Located in Boston (any neighborhood)",
    detail: "Article 85 applies citywide — all Boston neighborhoods including Roxbury, Dorchester, East Boston, South Boston, the South End, Jamaica Plain, and others.",
    applies: true,
  },
  {
    trigger: "Any demolition permit filed with ISD",
    detail: "The ordinance is triggered when you file a demolition permit application with Boston ISD. Even partial demolition of a qualifying structure may trigger review.",
    applies: true,
  },
];

const EXEMPTIONS = [
  {
    name: "Imminent Danger",
    detail: "If a structure is declared an imminent danger by the Building Commissioner, demolition can proceed immediately without delay. Requires formal declaration.",
  },
  {
    name: "Structures Under 50 Years Old",
    detail: "Article 85 does not apply to structures built within the last 50 years. Confirm the construction date from assessor records or building permits before assuming Article 85 applies.",
  },
  {
    name: "Previously Reviewed and Approved",
    detail: "If BPDA has previously reviewed and found the structure non-significant, a new delay period may not be imposed for an identical scope.",
  },
  {
    name: "Minor Structures",
    detail: "Accessory structures (garages, sheds) under a certain square footage threshold may be exempt. Confirm with BPDA at pre-application.",
  },
];

const PROCESS_STEPS = [
  {
    step: 1,
    name: "File Demolition Permit with ISD",
    detail: "Submit your demolition permit application at Boston ISD (1010 Massachusetts Ave). ISD identifies Article 85 applicability and notifies the Boston Landmarks Commission (BLC) and the Boston Planning & Development Agency (BPDA).",
    timeline: "Day 1",
  },
  {
    step: 2,
    name: "18-Month Clock Starts",
    detail: "Upon filing, the 18-month demolition delay clock starts automatically. ISD will not issue the demolition permit during this period unless an exemption applies or the delay is lifted.",
    timeline: "Days 1–18 months",
  },
  {
    step: 3,
    name: "Boston Landmarks Commission Review",
    detail: "The BLC has 30 days to determine if the structure may be historically significant. If BLC determines the structure is not significant, the delay may be shortened. If BLC opens a formal determination of eligibility, the full delay runs.",
    timeline: "30 days from filing",
  },
  {
    step: 4,
    name: "BPDA Alternatives Review",
    detail: "During the delay period, the BPDA works with the applicant to identify alternatives to full demolition: adaptive reuse, partial preservation, facade retention, or documentation/mitigation measures.",
    timeline: "Ongoing during delay",
  },
  {
    step: 5,
    name: "Delay Lifted or Period Expires",
    detail: "The delay ends when: (a) the 18-month period expires, (b) the applicant reaches agreement with BPDA on mitigation/alternatives, or (c) the structure is found non-significant. ISD can then issue the demolition permit.",
    timeline: "Up to 18 months",
  },
];

const NEGOTIATION_TIPS = [
  "Engage with BPDA early — before filing — to understand their concerns and your options.",
  "Commission a Historic Structure Report (HSR) to document the building's history. This shows good faith and often speeds review.",
  "Propose salvage and documentation: photographically documenting the structure and donating architectural elements often satisfies BPDA.",
  "Consider facade retention or adaptive reuse proposals — BPDA is more amenable when you show design flexibility.",
  "If your project timeline can't accommodate 18 months, begin the Article 85 process well before you need to break ground.",
  "Work with a land use attorney familiar with Boston Landmarks law if the structure may be historically significant.",
];

export default function Article85DemolitionPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#0F172A', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#64748B] mb-8">
        <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">Permit Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Boston</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">Article 85 Demolition Delay</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-[#14B8A6]" />
          <span className="text-sm font-medium text-[#14B8A6]">Boston Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Article 85 Demolition Delay Guide
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-3xl">
          Boston's Article 85 Demolition Delay Ordinance imposes an 18-month delay on demolishing
          structures 50 years or older. Understanding how it works — and how to navigate it — is
          critical for any Boston developer with a teardown or major renovation project.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-900/20 text-red-400 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            18-month delay clock
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-900/20 text-amber-400 px-3 py-1.5 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5" />
            Triggered for structures 50+ years old
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[rgba(20,184,166,0.08)] text-[#14B8A6] px-3 py-1.5 rounded-full">
            <Shield className="h-3.5 w-3.5" />
            BPDA + BLC review
          </span>
        </div>
      </div>

      {/* What is Article 85 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What Is Article 85?</h2>
        <div className="bg-[#0F172A] rounded-2xl p-6 text-[#94A3B8] space-y-3">
          <p>
            Article 85 of the Boston Zoning Code is the city's demolition delay ordinance. Its purpose
            is to preserve historically and architecturally significant buildings by requiring a review
            period before demolition can proceed.
          </p>
          <p>
            When you file a demolition permit for a structure that is 50 or more years old, Article 85
            automatically triggers an <strong className="text-white">18-month delay</strong>. During
            this time, the Boston Landmarks Commission (BLC) and the Boston Planning &amp; Development
            Agency (BPDA) review the structure and work with you on alternatives.
          </p>
          <p>
            Critically: the delay does <strong className="text-white">not</strong> mean you
            can never demolish. It means you must go through a process first. Most projects proceed
            to demolition — either after the full delay expires or by reaching agreement with BPDA
            on mitigation.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#1E293B] border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">BPDA / Article 85 Review</p>
              <p className="font-semibold text-white">1 City Hall Square</p>
              <p className="text-sm text-[#94A3B8]">Boston Planning &amp; Development Agency</p>
            </div>
            <div className="bg-[#1E293B] border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Boston Landmarks Commission</p>
              <p className="font-semibold text-white">1 City Hall Square, Room 805</p>
              <p className="text-sm text-[#94A3B8]">617-635-3850</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Triggers Article 85 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What Triggers the Delay</h2>
        <div className="space-y-3">
          {TRIGGERS.map((t) => (
            <div key={t.trigger} className="border border-red-700/30 bg-red-900/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{t.trigger}</p>
                  <p className="text-sm text-[#94A3B8] mt-1">{t.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exemptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Exemptions</h2>
        <div className="space-y-3">
          {EXEMPTIONS.map((e) => (
            <div key={e.name} className="border border-green-700/30 bg-green-900/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{e.name}</p>
                  <p className="text-sm text-[#94A3B8] mt-1">{e.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The 18-Month Process */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">The 18-Month Process</h2>
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
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Plan Your Project Timeline Accordingly</p>
              <p className="text-sm text-[#94A3B8] mt-1">
                If your project involves demolishing a 50+ year old structure, start the Article 85
                process <strong>18+ months before</strong> your target start date. Factor this delay
                into financing commitments, permitting budgets, and construction schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Negotiation Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Navigating the Delay Effectively</h2>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 space-y-3">
          {NEGOTIATION_TIPS.map((tip, i) => (
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
            { href: "/permits/boston/building-permit", label: "Boston Building Permit", desc: "Full ISD requirements and fee schedule" },
            { href: "/permits/boston/certificate-of-occupancy", label: "Certificate of Occupancy", desc: "Final inspection sequence and sign-offs" },
            { href: "/permits/boston/zba-variance", label: "Boston ZBA Variance Guide", desc: "2026 hearing schedule and process" },
            { href: "/permits/boston/article-80-review", label: "Article 80 Review", desc: "Large project BPDA review (≥50k sq ft)" },
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
            Track Your Article 85 Clock in MeritLayer
          </h2>
          <p className="text-[#94A3B8] mb-6">
            Upload your demolition permit filing, set the 18-month deadline, track BPDA correspondence,
            and get automated alerts before critical milestones — so you never miss a window.
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
