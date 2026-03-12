"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import {
  FileText,
  Clock,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
  FileSearch,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "AI Document Intelligence",
    description:
      "Upload permits, inspection reports, and compliance docs. Our AI extracts deadlines, requirements, and conditions automatically.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Smart Deadline Tracking",
    description:
      "Never miss a permit deadline again. Get alerts at 7 days, 3 days, and 1 day before any deadline.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Shield,
    title: "Compliance Dashboard",
    description:
      "See your compliance health at a glance. Color-coded status shows what's on track, what needs attention, and what's overdue.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: Bell,
    title: "Proactive Alerts",
    description:
      "Email and in-app notifications keep your team informed. Customize alert timing and preferences.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 999,
    description: "Perfect for small contractors",
    features: [
      "1 active project",
      "100 documents/month",
      "AI document processing",
      "Deadline alerts",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: 2499,
    description: "For growing construction firms",
    features: [
      "5 active projects",
      "Unlimited documents",
      "AI document processing",
      "Priority deadline alerts",
      "Compliance reports",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 4999,
    description: "For large-scale operations",
    features: [
      "Unlimited projects",
      "Unlimited documents",
      "Custom compliance rules",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
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
    <div className="min-h-screen text-[#F1F5F9]" style={{ background: '#080D1A' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,13,26,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Link href="/permits">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                  Permit Guides
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" style={{ boxShadow: "0 0 20px rgba(20,184,166,0.25)" }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.15) 0%, transparent 60%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ border: '1px solid rgba(20,184,166,0.3)', background: 'rgba(20,184,166,0.08)', color: '#14B8A6' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              AI-Powered Compliance
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#F1F5F9] mb-6">
              Never miss a permit
              <br />
              <span style={{ background: 'linear-gradient(135deg, #14B8A6, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                deadline again
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: '#64748B' }}>
              MeritLayer is the AI brain that reads your compliance documents, tracks deadlines,
              maps requirements, and alerts you before anything falls through the cracks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button
                  className="px-8 py-4 rounded-xl font-semibold text-[#080D1A] transition-all hover:scale-[1.02] flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5A5)', boxShadow: '0 0 30px rgba(20,184,166,0.3), 0 4px 15px rgba(0,0,0,0.3)' }}
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <a href="#pricing">
                <button className="px-8 py-4 rounded-xl font-semibold transition-all hover:bg-[rgba(255,255,255,0.05)]"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8' }}>
                  View Pricing
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20" style={{ background: 'rgba(14,21,37,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Permit delays cost contractors $10K–$100K per week
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              General contractors spend 20–30 hours per week on permit paperwork. Missed deadlines
              mean $5K–$50K fines per violation. Failed inspections from missing docs delay
              projects for weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border border-red-500/20 rounded-xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle className="text-foreground">$50K+ in Fines</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Average annual cost of missed permit deadlines for mid-size contractors
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border border-amber-500/20 rounded-xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-foreground">25+ Hours/Week</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Time spent manually tracking permits, deadlines, and compliance requirements
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border border-secondary/20 rounded-xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-foreground">300+ Documents</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Average compliance documents per project that need tracking and monitoring
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI-powered compliance management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your documents and let our AI do the heavy lifting. No more manual data entry
              or missed deadlines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
                style={{ background: 'rgba(14,21,37,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(20,184,166,0.1)', boxShadow: '0 0 15px rgba(20,184,166,0.15)' }}>
                  <feature.icon className="h-5 w-5 text-[#14B8A6]" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F5F9] mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ background: 'rgba(14,21,37,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "1", title: "Upload Documents", desc: "Drag and drop permits, inspection reports, certificates, and any compliance documents." },
              { n: "2", title: "AI Extracts Data", desc: "Our AI reads each document, extracting deadlines, requirements, permit numbers, and conditions." },
              { n: "3", title: "Stay Compliant", desc: "Get alerts before deadlines, track compliance status, and never miss a requirement again." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{n}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business. All plans include AI document processing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="relative rounded-2xl p-6 transition-all"
                style={{
                  background: '#0E1525',
                  border: plan.popular ? '1px solid #14B8A6' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: plan.popular ? '0 0 30px rgba(20,184,166,0.12)' : 'none',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#080D1A]"
                      style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5A5)' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#F1F5F9] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#475569] mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#14B8A6]">${plan.price.toLocaleString()}</span>
                  <span className="text-[#475569]">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#14B8A6] shrink-0" />
                      <span className="text-sm text-[#64748B]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block">
                  <button
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                    style={plan.popular
                      ? { background: 'linear-gradient(135deg, #14B8A6, #0EA5A5)', color: '#080D1A', boxShadow: '0 0 20px rgba(20,184,166,0.2)' }
                      : { border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', background: 'transparent' }
                    }
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: 'rgba(14,21,37,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by construction professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border border-white/10 rounded-xl">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic mb-4">
                    "MeritLayer has transformed how we manage compliance. We've cut our admin time
                    in half and haven't missed a deadline since we started using it."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full" />
                    <div>
                      <p className="font-semibold text-foreground">Project Manager</p>
                      <p className="text-sm text-muted-foreground">Construction Firm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)", opacity: 0.15 }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join the waitlist for early access
          </h2>
          <p className="text-muted-foreground mb-8">
            Be the first to know when we launch new features and get exclusive early access pricing.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card border-white/20"
                required
              />
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-white/20"
              />
            </div>
            <Input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-card border-white/20 max-w-xl mx-auto"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} MeritLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
