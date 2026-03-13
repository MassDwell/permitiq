"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  Play,
} from "lucide-react";

const CSS_ANIMATIONS = `
  @keyframes meshOrb1 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(-50px, 35px) scale(1.15); }
    66% { transform: translate(35px, -25px) scale(0.88); }
  }
  @keyframes meshOrb2 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(55px, 22px) scale(0.82); }
    66% { transform: translate(-25px, -35px) scale(1.22); }
  }
  @keyframes meshOrb3 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    50% { transform: translate(-30px, 45px) scale(1.1); }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(0.5deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(12px) rotate(-0.5deg); }
  }
  @keyframes floatC {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes statPop {
    0% { opacity: 0; transform: scale(0.75) translateY(16px); }
    60% { transform: scale(1.05) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.25); }
    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
  }
  @keyframes lineSlide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes badgePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

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
    founderPrice: 49,
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
    founderPrice: 99,
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
    founderPrice: 199,
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

const avatars = [
  { initials: "JM", bg: "#1D4ED8" },
  { initials: "SR", bg: "#7C3AED" },
  { initials: "AK", bg: "#059669" },
  { initials: "TC", bg: "#DC2626" },
  { initials: "BW", bg: "#B45309" },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [gaugeScore, setGaugeScore] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Animate compliance score gauge on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setGaugeScore(current);
        if (current >= 94) clearInterval(interval);
      }, 14);
      return () => clearInterval(interval);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

  // SVG gauge params
  const gaugeRadius = 50;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius; // ≈ 314.16
  const gaugeOffset = gaugeCircumference * (1 - gaugeScore / 100);

  return (
    <div className="min-h-screen text-[#F1F5F9]" style={{ background: "#060D1A" }}>
      <style>{CSS_ANIMATIONS}</style>

      {/* ── NAVIGATION ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,13,26,0.92)" }}
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
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ paddingTop: "80px", paddingBottom: "60px" }}
      >
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: "10%",
              width: "700px",
              height: "700px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)",
              animation: "meshOrb1 14s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "25%",
              right: "5%",
              width: "550px",
              height: "550px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6,182,212,0.11) 0%, transparent 70%)",
              animation: "meshOrb2 17s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "30%",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)",
              animation: "meshOrb3 20s ease-in-out infinite",
            }}
          />
          {/* Top horizon line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(6,182,212,0.3), transparent)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Headline block */}
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h1 className="text-5xl md:text-[4.5rem] lg:text-[5.25rem] font-extrabold tracking-tight leading-[1.04] text-white mb-6">
              Every deadline tracked.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #60A5FA 0%, #22D3EE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Every project protected.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#94A3B8" }}>
              MeritLayer reads your permit documents, maps every deadline, and alerts your team
              before anything slips through the cracks. Built for Boston developers and GCs.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/sign-up">
                <button
                  className="px-9 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.03] flex items-center gap-2.5 text-base"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                    boxShadow: "0 0 50px rgba(59,130,246,0.45), 0 6px 24px rgba(0,0,0,0.4)",
                    animation: "pulseRing 3s ease-in-out infinite",
                  }}
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button
                  className="px-9 py-4 rounded-xl font-semibold transition-all hover:bg-white/5 text-base flex items-center gap-2.5"
                  style={{ border: "1px solid rgba(255,255,255,0.14)", color: "#94A3B8" }}
                >
                  <Play className="h-4 w-4" style={{ fill: "#94A3B8" }} />
                  Watch Demo
                </button>
              </a>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.map((av, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 shrink-0"
                    style={{ background: av.bg, borderColor: "#060D1A" }}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: "#64748B" }}>
                Trusted by{" "}
                <span style={{ color: "#CBD5E1", fontWeight: 600 }}>47+</span>{" "}
                Boston developers
              </p>
            </div>
          </div>

          {/* Dashboard Mockup with Floating Cards */}
          <div className="relative max-w-4xl mx-auto">
            {/* Floating Card — Foundation Inspection (left) */}
            <div
              className="absolute -left-6 top-[28%] z-10 hidden xl:block"
              style={{ animation: "floatA 4.2s ease-in-out infinite" }}
            >
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(245,158,11,0.45)",
                  boxShadow: "0 0 24px rgba(245,158,11,0.18), 0 10px 36px rgba(0,0,0,0.45)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(245,158,11,0.12)" }}
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748B] leading-none mb-0.5">Foundation Inspection</p>
                    <p className="text-xs font-bold text-amber-400 leading-none">Due in 3 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card — Certificate of Occupancy (right) */}
            <div
              className="absolute -right-6 top-[40%] z-10 hidden xl:block"
              style={{ animation: "floatB 5.5s ease-in-out infinite" }}
            >
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(59,130,246,0.45)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.18), 0 10px 36px rgba(0,0,0,0.45)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(59,130,246,0.12)" }}
                  >
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748B] leading-none mb-0.5">Certificate of Occupancy</p>
                    <p className="text-xs font-bold text-blue-400 leading-none">Due in 12 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card — Electrical OVERDUE (top-right) */}
            <div
              className="absolute -right-2 -top-8 z-10 hidden xl:block"
              style={{ animation: "floatC 3.8s ease-in-out infinite" }}
            >
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(239,68,68,0.5)",
                  boxShadow: "0 0 24px rgba(239,68,68,0.22), 0 10px 36px rgba(0,0,0,0.45)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(239,68,68,0.12)" }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748B] leading-none mb-0.5">Electrical Permit</p>
                    <p className="text-xs font-bold text-red-400 leading-none tracking-wide">OVERDUE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Window */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(59,130,246,0.22)",
                background: "#0D1526",
                boxShadow:
                  "0 0 100px rgba(59,130,246,0.14), 0 40px 100px rgba(0,0,0,0.65)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#080F1E" }}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
                <span className="ml-4 text-xs" style={{ color: "#334155" }}>
                  MeritLayer — Project Dashboard
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "badgePulse 2s ease-in-out infinite" }} />
                  <span className="text-[10px] text-green-400">Live</span>
                </div>
              </div>

              {/* Dashboard grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Compliance Score Gauge */}
                <div
                  className="rounded-xl p-5 col-span-1 flex flex-col items-center"
                  style={{ background: "#060D1A", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-3 self-start font-semibold">
                    Compliance Score
                  </p>
                  <div className="relative flex items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`Compliance score: ${gaugeScore}%`}>
                      {/* Track */}
                      <circle
                        cx="60"
                        cy="60"
                        r={gaugeRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="9"
                      />
                      {/* Progress */}
                      <circle
                        cx="60"
                        cy="60"
                        r={gaugeRadius}
                        fill="none"
                        stroke="url(#gaugeGrad)"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={gaugeCircumference}
                        strokeDashoffset={gaugeOffset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dashoffset 0.04s linear" }}
                      />
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22C55E" />
                          <stop offset="100%" stopColor="#4ADE80" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-white leading-none">{gaugeScore}</span>
                      <span className="text-[11px] mt-0.5" style={{ color: "#475569" }}>/ 100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">On track</span>
                  </div>
                </div>

                {/* Deadlines */}
                <div
                  className="rounded-xl p-4 col-span-1"
                  style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-3 font-semibold">
                    Upcoming Deadlines
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Foundation Inspection", tag: "3 days", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
                      { label: "Certificate of Occupancy", tag: "12 days", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
                      { label: "Electrical Permit", tag: "OVERDUE", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
                    ].map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: d.bg, border: `1px solid ${d.border}` }}
                      >
                        <span className="text-xs text-[#94A3B8] truncate pr-2">{d.label}</span>
                        <span className="text-[11px] font-bold shrink-0" style={{ color: d.color }}>
                          {d.tag}
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
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-3 font-semibold">
                    Active Alerts
                  </p>
                  <div className="space-y-2">
                    <div
                      className="flex items-start gap-2 p-2 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.07)" }}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Electrical permit expired — action required</span>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2 rounded-lg"
                      style={{ background: "rgba(245,158,11,0.07)" }}
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Foundation inspection due in 3 days</span>
                    </div>
                    <div
                      className="flex items-start gap-2 p-2 rounded-lg"
                      style={{ background: "rgba(34,197,94,0.07)" }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-[#94A3B8]">Building permit renewed ✓</span>
                    </div>
                  </div>
                </div>

                {/* Projects */}
                <div
                  className="rounded-xl p-4 col-span-1 md:col-span-3"
                  style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest font-semibold">Active Projects</p>
                    <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                      View all →
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Seaport Mixed-Use", pct: 78, color: "#F59E0B", status: "Action Needed" },
                      { name: "South End ADU", pct: 55, color: "#EF4444", status: "At Risk" },
                      { name: "Fenway Renovation", pct: 91, color: "#22C55E", status: "On Track" },
                    ].map((p) => (
                      <div key={p.name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-[#94A3B8] truncate">{p.name}</span>
                          <span className="text-xs font-bold ml-1 shrink-0" style={{ color: p.color }}>
                            {p.pct}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${p.pct}%`, background: p.color, opacity: 0.85 }}
                          />
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: p.color, opacity: 0.7 }}>{p.status}</p>
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
              <span style={{ color: "#64748B" }}>They happen because teams can&apos;t see what&apos;s coming.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: "#EF4444",
                bg: "rgba(239,68,68,0.07)",
                border: "rgba(239,68,68,0.2)",
                glow: "rgba(239,68,68,0.08)",
                title: "Permit deadlines buried in email threads",
                desc: "Critical dates get lost across inboxes, Slack channels, and spreadsheets. One missed email costs weeks of delay.",
              },
              {
                icon: AlertTriangle,
                color: "#F59E0B",
                bg: "rgba(245,158,11,0.07)",
                border: "rgba(245,158,11,0.2)",
                glow: "rgba(245,158,11,0.08)",
                title: "Compliance violations blindside you at closing",
                desc: "Conditions buried in 80-page approval documents. Violations discovered during final walkthrough. $5K–$50K fines per incident.",
              },
              {
                icon: Clock,
                color: "#F97316",
                bg: "rgba(249,115,22,0.07)",
                border: "rgba(249,115,22,0.2)",
                glow: "rgba(249,115,22,0.08)",
                title: "Hours wasted tracking down inspection status",
                desc: "Your PM calls the city. Again. 25+ hours per week chasing permit offices instead of closing projects.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-7 transition-all hover:translate-y-[-3px]"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  boxShadow: `0 0 40px ${item.glow}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                    boxShadow: `0 0 20px ${item.glow}`,
                  }}
                >
                  <item.icon className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2.5">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24" style={{ background: "#060D1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
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
              Upload your documents and let our AI do the heavy lifting. No more manual data entry. No more missed deadlines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-7 transition-all hover:translate-y-[-2px] group"
                style={{
                  background: "#0D1526",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    boxShadow: "0 0 20px rgba(59,130,246,0.15)",
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
              boxShadow: "0 0 60px rgba(59,130,246,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Compliance Checklist</h3>
                <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
                  Seaport Mixed-Use Development · Boston ISD
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                94% Complete
              </div>
            </div>
            <div className="space-y-2.5">
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
                  className="flex items-center justify-between py-3 px-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
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
                            ? "#475569"
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
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-md shrink-0"
                      style={{
                        background: item.status === "pending" ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.08)",
                        color: item.status === "pending" ? "#F59E0B" : "#60A5FA",
                        border: `1px solid ${item.status === "pending" ? "rgba(245,158,11,0.2)" : "rgba(59,130,246,0.15)"}`,
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
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
            <div
              className="absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px hidden md:block -z-10"
              style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.35), rgba(59,130,246,0.35), transparent)" }}
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
                    boxShadow: "0 0 30px rgba(59,130,246,0.12)",
                  }}
                >
                  <Icon className="h-8 w-8 text-blue-400" />
                  <span
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
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
            className="rounded-2xl p-10 md:p-14"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(6,182,212,0.05) 100%)",
              border: "1px solid rgba(59,130,246,0.15)",
              boxShadow: "0 0 80px rgba(59,130,246,0.06)",
            }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Real results for real projects.
              </h2>
            </div>
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((s, i) => (
                <div
                  key={s.value}
                  className="text-center"
                  style={
                    statsVisible
                      ? {
                          animation: `statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s both`,
                        }
                      : { opacity: 0 }
                  }
                >
                  <div
                    className="text-4xl md:text-5xl font-extrabold mb-3 leading-none"
                    style={{
                      background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-sm leading-snug" style={{ color: "#64748B" }}>{s.label}</div>
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)", color: "#93C5FD" }}
            >
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lock in your rate before prices go up.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
              Founding Member pricing is available for a limited time. Your rate locks in permanently — even as we add features and raise prices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-7 transition-all hover:translate-y-[-3px]"
                style={{
                  background: plan.popular ? "rgba(59,130,246,0.06)" : "#0D1526",
                  border: plan.popular ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: plan.popular ? "0 0 50px rgba(59,130,246,0.13)" : "none",
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
                <p className="text-sm mb-6" style={{ color: "#475569" }}>{plan.description}</p>

                <div className="mb-2">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-5xl font-extrabold"
                      style={
                        plan.popular
                          ? {
                              background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }
                          : { color: "#F1F5F9" }
                      }
                    >
                      ${plan.founderPrice}
                    </span>
                    <span className="text-sm" style={{ color: "#475569" }}>/month</span>
                    <span
                      className="text-lg font-medium line-through"
                      style={{ color: "#334155" }}
                    >
                      ${plan.regularPrice}
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-5"
                    style={{
                      background: "rgba(251,191,36,0.1)",
                      border: "1px solid rgba(251,191,36,0.25)",
                      color: "#FCD34D",
                    }}
                  >
                    🔒 Founding Member Price — locks in forever
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
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
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={
                      plan.popular
                        ? {
                            background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                            color: "white",
                            boxShadow: "0 0 30px rgba(59,130,246,0.3)",
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

          <p className="text-center text-sm mt-10" style={{ color: "#475569" }}>
            Need a custom plan?{" "}
            <a href="mailto:hello@meritlayer.ai" className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact us →
            </a>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "#060D1A" }}>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px -z-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(6,182,212,0.4), transparent)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px -z-10"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Stop managing permits
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60A5FA, #22D3EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in spreadsheets.
            </span>
          </h2>
          <p className="text-xl mb-12" style={{ color: "#94A3B8" }}>
            No credit card required. 14-day free trial. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/sign-up">
              <button
                className="px-12 py-5 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.04] flex items-center gap-2.5"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                  boxShadow: "0 0 60px rgba(59,130,246,0.5), 0 6px 28px rgba(0,0,0,0.4)",
                }}
              >
                Get Started Free
                <ChevronRight className="h-6 w-6" />
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
              Get exclusive early access and be first to hear about new features.
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
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                  color: "white",
                  boxShadow: "0 0 24px rgba(59,130,246,0.2)",
                }}
              >
                {joinWaitlist.isPending ? "Joining..." : "Join Waitlist →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#060D1A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Logo size="sm" />
              <p className="mt-3 text-sm max-w-xs leading-relaxed" style={{ color: "#475569" }}>
                AI-powered permit and compliance management for Boston&apos;s real estate developers and construction firms.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#334155" }}>Product</p>
              <div className="space-y-2.5">
                <a href="#how-it-works" className="block text-sm transition-colors hover:text-[#94A3B8]" style={{ color: "#64748B" }}>
                  How It Works
                </a>
                <a href="#pricing" className="block text-sm transition-colors hover:text-[#94A3B8]" style={{ color: "#64748B" }}>
                  Pricing
                </a>
                <Link href="/permits" className="block text-sm transition-colors hover:text-[#94A3B8]" style={{ color: "#64748B" }}>
                  Permit Guides
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#334155" }}>Account</p>
              <div className="space-y-2.5">
                <Link href="/sign-in" className="block text-sm transition-colors hover:text-[#94A3B8]" style={{ color: "#64748B" }}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="block text-sm transition-colors hover:text-[#94A3B8]" style={{ color: "#64748B" }}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
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
