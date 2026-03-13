"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import {
  FileSearch,
  Calendar,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Zap,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "AI Document Intelligence",
    description:
      "Upload permits, inspection reports, and compliance docs. Our AI extracts deadlines, requirements, and conditions automatically — even from 84-page PDFs.",
  },
  {
    icon: Calendar,
    title: "Smart Deadline Tracking",
    description:
      "Never miss a permit deadline again. Automated alerts at 7 days, 3 days, and 1 day before any critical deadline.",
  },
  {
    icon: Shield,
    title: "Compliance Dashboard",
    description:
      "See your compliance health at a glance. Color-coded status shows what's on track, what needs attention, and what's overdue.",
  },
  {
    icon: Bell,
    title: "Proactive Alerts",
    description:
      "Email and in-app notifications keep your team informed. Customize alert timing and never be caught off guard again.",
  },
];

const pricingPlans = [
  {
    name: "Solo",
    price: 49,
    regularPrice: 149,
    description: "Perfect for independent developers.",
    features: [
      "Up to 3 active projects",
      "AI document extraction",
      "Compliance checklist tracking",
      "Permit workflow tracker",
      "Public permit guides",
      "Soft costs calculator",
      "Email support",
    ],
  },
  {
    name: "Developer",
    price: 99,
    regularPrice: 349,
    description: "For development teams managing multiple projects.",
    features: [
      "Everything in Solo",
      "Up to 10 active projects",
      "3 team members",
      "AI permit research with source citations",
      "Inspection tracker",
      "Comment response assistant",
      "AHJ contact directory",
      "Priority email support",
    ],
    popular: true,
  },
  {
    name: "Portfolio",
    price: 199,
    regularPrice: 749,
    description: "For firms managing large project portfolios.",
    features: [
      "Everything in Developer",
      "Unlimited projects",
      "Unlimited team members",
      "API access",
      "White-label option",
      "Custom AHJ integrations",
      "Dedicated onboarding call",
      "Phone + email support",
    ],
  },
];

const stats = [
  { value: "84-page", label: "documents processed in seconds" },
  { value: "Zero", label: "missed deadlines for active users" },
  { value: "8–12 wks", label: "saved per project" },
  { value: "6+", label: "MA jurisdictions supported" },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      toast.success("You're on the list! We'll be in touch soon.");
      setEmail("");
      setName("");
      setCompany("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    joinWaitlist.mutate({ email, name, company });
  };

  return (
    <div className="min-h-screen text-[#F1F5F9]" style={{ background: "#060D1A" }}>

      {/* ── NAVIGATION ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,13,26,0.88)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-6">
              <Link href="/permits" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                Permit Guides
              </Link>
              <a href="#pricing" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <button className="text-sm px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className="text-sm px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                    boxShadow: "0 0 20px rgba(59,130,246,0.35)",
                  }}
                >
                  Start Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -5%, rgba(59,130,246,0.18) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-px -z-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{
                border: "1px solid rgba(59,130,246,0.3)",
                background: "rgba(59,130,246,0.08)",
                color: "#93C5FD",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              AI-Powered Permit &amp; Compliance Management
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
              Your permit deadlines
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #60A5FA 0%, #22D3EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                don&apos;t care about spreadsheets.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#94A3B8" }}>
              MeritLayer reads your compliance documents, maps every deadline, and alerts your team before
              anything falls through the cracks. Built for Boston developers and GCs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button
                  className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.03] flex items-center gap-2 text-base"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                    boxShadow: "0 0 40px rgba(59,130,246,0.35), 0 4px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:bg-white/5 text-base"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8" }}
                >
                  See How It Works
                </button>
              </a>
            </div>

            {/* Social proof bar */}
            <p className="mt-10 text-sm" style={{ color: "#475569" }}>
              <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Trusted by developers managing projects across Massachusetts
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div
              className="absolute inset-0 -z-10 blur-3xl"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.12), transparent 70%)" }}
            />
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(59,130,246,0.2)",
                background: "#0D1526",
                boxShadow: "0 0 60px rgba(59,130,246,0.1), 0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0A1020" }}
              >
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-4 text-xs text-[#475569]">MeritLayer — Project Dashboard</span>
              </div>

              {/* Dashboard content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Compliance Score */}
                <div
                  className="rounded-xl p-4 col-span-1"
                  style={{ background: "#060D1A", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <p className="text-xs text-[#475569] uppercase tracking-wider mb-1">Compliance Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-green-400">94</span>
                    <span className="text-green-400 text-sm mb-1">/ 100</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full w-[94%] rounded-full" style={{ background: "linear-gradient(90deg, #22C55E, #16A34A)" }} />
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#22C55E" }}>On track</p>
                </div>

                {/* Active Deadlines */}
                <div
                  className="rounded-xl p-4 col-span-1"
                  style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-xs text-[#475569] uppercase tracking-wider mb-3">Upcoming Deadlines</p>
                  <div className="space-y-2">
                    {[
                      { label: "Foundation Inspection", days: 3, color: "#F59E0B" },
                      { label: "Framing Permit Renewal", days: 7, color: "#3B82F6" },
                      { label: "Electrical Sign-Off", days: 14, color: "#22C55E" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center justify-between">
                        <span className="text-xs text-[#94A3B8] truncate">{d.label}</span>
                        <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: d.color }}>
                          {d.days}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                <div
                  className="rounded-xl p-4 col-span-1"
                  style={{ background: "#060D1A", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#475569" }}>Active Alerts</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Article 80 review due in 3 days</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Zoning variance expires soon</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Building permit renewed ✓</span>
                    </div>
                  </div>
                </div>

                {/* Projects row */}
                <div
                  className="rounded-xl p-4 col-span-1 md:col-span-3"
                  style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#475569] uppercase tracking-wider">Active Projects</p>
                    <span className="text-xs text-blue-400">View all →</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Seaport Mixed-Use", status: "On Track", pct: 78, color: "#22C55E" },
                      { name: "South End ADU", status: "Action Needed", pct: 55, color: "#F59E0B" },
                      { name: "Fenway Renovation", status: "On Track", pct: 91, color: "#22C55E" },
                    ].map((p) => (
                      <div key={p.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[#94A3B8] truncate">{p.name}</span>
                          <span className="text-xs font-semibold ml-1 shrink-0" style={{ color: p.color }}>{p.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color, opacity: 0.7 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24" style={{ background: "#080F1E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Permit delays don&apos;t happen by accident.
              <br />
              <span style={{ color: "#94A3B8" }}>They happen because teams can&apos;t see what&apos;s coming.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: "#EF4444",
                bg: "rgba(239,68,68,0.08)",
                border: "rgba(239,68,68,0.2)",
                title: "Permit deadlines buried in email threads",
                desc: "Critical dates get lost across inboxes, Slack channels, and spreadsheets. One missed email costs weeks of delay.",
              },
              {
                icon: AlertTriangle,
                color: "#F59E0B",
                bg: "rgba(245,158,11,0.08)",
                border: "rgba(245,158,11,0.2)",
                title: "Compliance violations blindside you at closing",
                desc: "Conditions buried in 80-page approval documents. Violations discovered during final walkthrough. $5K–$50K fines per incident.",
              },
              {
                icon: Clock,
                color: "#F97316",
                bg: "rgba(249,115,22,0.08)",
                border: "rgba(249,115,22,0.2)",
                title: "Hours wasted tracking down inspection status",
                desc: "Your PM calls the city. Again. 25+ hours per week chasing permit offices instead of closing projects.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: item.bg, border: `1px solid ${item.border}` }}
                >
                  <item.icon className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / FEATURES ── */}
      <section className="py-24" style={{ background: "#060D1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)", color: "#93C5FD" }}
            >
              <Zap className="h-3 w-3" />
              The Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              One platform for every permit,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                every deadline, every project.
              </span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94A3B8" }}>
              Upload your documents and let our AI do the heavy lifting. No more manual data entry.
              No more missed deadlines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 transition-all hover:translate-y-[-2px] hover:border-blue-500/30 group"
                style={{
                  background: "#0D1526",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    boxShadow: "0 0 15px rgba(59,130,246,0.15)",
                  }}
                >
                  <feature.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Compliance Checklist Mockup */}
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "#0D1526",
              border: "1px solid rgba(59,130,246,0.15)",
              boxShadow: "0 0 40px rgba(59,130,246,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Compliance Checklist</h3>
                <p className="text-sm text-[#64748B]">Seaport Mixed-Use Development · Boston ISD</p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                94% Complete
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Building Permit Application", status: "complete" },
                { label: "Zoning Variance Approval (Article 80)", status: "complete" },
                { label: "Environmental Impact Review", status: "complete" },
                { label: "Foundation Inspection Sign-Off", status: "pending", due: "3 days" },
                { label: "Electrical Rough-In Inspection", status: "upcoming", due: "14 days" },
                { label: "Certificate of Occupancy", status: "upcoming", due: "Est. 6 months" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2.5 px-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    {item.status === "complete" ? (
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    ) : item.status === "pending" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-[#334155] shrink-0" />
                    )}
                    <span
                      className="text-sm"
                      style={{
                        color:
                          item.status === "complete"
                            ? "#64748B"
                            : item.status === "pending"
                            ? "#F1F5F9"
                            : "#94A3B8",
                        textDecoration: item.status === "complete" ? "line-through" : "none",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.due && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{
                        background: item.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.08)",
                        color: item.status === "pending" ? "#F59E0B" : "#60A5FA",
                      }}
                    >
                      {item.due}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24" style={{ background: "#080F1E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)", color: "#93C5FD" }}
            >
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Up and running in three steps.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
              No lengthy onboarding. No data migration. Connect your projects and let MeritLayer get to work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div
              className="absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px hidden md:block -z-10"
              style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(59,130,246,0.3), transparent)" }}
            />

            {[
              {
                n: "01",
                icon: Upload,
                title: "Upload your permits & documents",
                desc: "Drag and drop permits, inspection reports, certificates, and compliance docs. We accept PDF, DOCX, and images.",
              },
              {
                n: "02",
                icon: Zap,
                title: "AI extracts deadlines & requirements",
                desc: "Our AI reads every page, extracting deadlines, permit numbers, conditions, and compliance requirements — automatically.",
              },
              {
                n: "03",
                icon: TrendingUp,
                title: "Get alerts, track progress, close on time",
                desc: "Automated alerts keep your team ahead of every deadline. Track compliance health across all active projects.",
              },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="relative text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                  style={{
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    boxShadow: "0 0 30px rgba(59,130,246,0.1)",
                  }}
                >
                  <Icon className="h-8 w-8 text-blue-400" />
                  <span
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "white" }}
                  >
                    {n.replace("0", "")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#64748B" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20" style={{ background: "#060D1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.06) 100%)",
              border: "1px solid rgba(59,130,246,0.15)",
              boxShadow: "0 0 60px rgba(59,130,246,0.06)",
            }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Real results for real projects.
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.value} className="text-center">
                  <div
                    className="text-3xl md:text-4xl font-extrabold mb-2"
                    style={{
                      background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24" style={{ background: "#080F1E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)", color: "#93C5FD" }}
            >
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lock in your rate before prices go up.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
              Founding member pricing is locked in forever. Regular pricing launches April 15, 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-7 transition-all hover:translate-y-[-2px]"
                style={{
                  background: plan.popular ? "rgba(59,130,246,0.06)" : "#0D1526",
                  border: plan.popular ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: plan.popular ? "0 0 40px rgba(59,130,246,0.12)" : "none",
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#475569" }}>{plan.description}</p>

                <div className="mb-7">
                  <span
                    className="text-4xl font-extrabold"
                    style={{
                      background: plan.popular
                        ? "linear-gradient(135deg, #60A5FA, #22D3EE)"
                        : "none",
                      WebkitBackgroundClip: plan.popular ? "text" : "unset",
                      WebkitTextFillColor: plan.popular ? "transparent" : "#F1F5F9",
                    }}
                  >
                    ${plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm ml-1" style={{ color: "#475569" }}>/month</span>
                  {plan.regularPrice && (
                    <span className="ml-2 text-sm line-through" style={{ color: "#475569" }}>${plan.regularPrice}/mo</span>
                  )}
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle
                        className="h-4 w-4 shrink-0"
                        style={{ color: plan.popular ? "#60A5FA" : "#3B82F6" }}
                      />
                      <span className="text-sm" style={{ color: "#94A3B8" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/sign-up" className="block">
                  <button
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={
                      plan.popular
                        ? {
                            background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                            color: "white",
                            boxShadow: "0 0 25px rgba(59,130,246,0.3)",
                          }
                        : {
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#94A3B8",
                            background: "transparent",
                          }
                    }
                  >
                    Claim Founding Price
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: "#475569" }}>
            Need a custom plan?{" "}
            <a href="mailto:hello@meritlayer.ai" className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact us →
            </a>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "#060D1A" }}>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px -z-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Start managing permits
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              like a professional.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#94A3B8" }}>
            No credit card required. 14-day free trial. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/sign-up">
              <button
                className="px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.04] flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                  boxShadow: "0 0 50px rgba(59,130,246,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                Get Started Free
                <ChevronRight className="h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* Waitlist form */}
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{ background: "#0D1526", border: "1px solid rgba(59,130,246,0.12)" }}
          >
            <p className="text-sm font-semibold text-white mb-1">Join the early access waitlist</p>
            <p className="text-sm mb-6" style={{ color: "#475569" }}>
              Get exclusive early access pricing and be first to hear about new features.
            </p>
            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#060D1A] border-white/10 text-white placeholder:text-[#334155] focus:border-blue-500/50"
                  required
                />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#060D1A] border-white/10 text-white placeholder:text-[#334155] focus:border-blue-500/50"
                />
              </div>
              <Input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-[#060D1A] border-white/10 text-white placeholder:text-[#334155] focus:border-blue-500/50"
              />
              <button
                type="submit"
                disabled={joinWaitlist.isPending}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                  color: "white",
                  boxShadow: "0 0 20px rgba(59,130,246,0.2)",
                }}
              >
                {joinWaitlist.isPending ? "Joining..." : "Join Waitlist →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#060D1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <Logo size="sm" />
              <p className="mt-3 text-sm max-w-xs" style={{ color: "#475569" }}>
                AI-powered permit and compliance management for Boston&apos;s real estate developers and construction firms.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#334155" }}>Product</p>
              <div className="space-y-2">
                <a href="#how-it-works" className="block text-sm transition-colors" style={{ color: "#64748B" }}>
                  How It Works
                </a>
                <a href="#pricing" className="block text-sm transition-colors" style={{ color: "#64748B" }}>
                  Pricing
                </a>
                <Link href="/permits" className="block text-sm transition-colors" style={{ color: "#64748B" }}>
                  Permit Guides
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#334155" }}>Account</p>
              <div className="space-y-2">
                <Link href="/sign-in" className="block text-sm transition-colors" style={{ color: "#64748B" }}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="block text-sm transition-colors" style={{ color: "#64748B" }}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs" style={{ color: "#334155" }}>
              &copy; 2026 MeritLayer. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs" style={{ color: "#334155" }}>
              <MapPin className="h-3 w-3" />
              Boston, MA
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
