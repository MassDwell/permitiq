"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
  Building2,
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
  },
  {
    icon: Calendar,
    title: "Smart Deadline Tracking",
    description:
      "Never miss a permit deadline again. Get alerts at 7 days, 3 days, and 1 day before any deadline.",
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
      "Email and in-app notifications keep your team informed. Customize alert timing and preferences.",
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">MeritLayer</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              AI-Powered Compliance
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Never miss a permit
              <br />
              <span className="text-blue-600">deadline again</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              MeritLayer is the AI brain that reads your compliance documents, tracks deadlines,
              maps requirements, and alerts you before anything falls through the cracks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Permit delays cost contractors $10K-$100K per week
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              General contractors spend 20-30 hours per week on permit paperwork. Missed deadlines
              mean $5K-$50K fines per violation. Failed inspections from missing docs delay
              projects for weeks. Institutional knowledge walks out the door when key staff leave.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
                <CardTitle>$50K+ in Fines</CardTitle>
                <CardDescription>
                  Average annual cost of missed permit deadlines for mid-size contractors
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>25+ Hours/Week</CardTitle>
                <CardDescription>
                  Time spent manually tracking permits, deadlines, and compliance requirements
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle>300+ Documents</CardTitle>
                <CardDescription>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-powered compliance management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your documents and let our AI do the heavy lifting. No more manual data entry
              or missed deadlines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-gray-600">
                Drag and drop permits, inspection reports, certificates, and any compliance
                documents.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Extracts Data</h3>
              <p className="text-gray-600">
                Our AI reads each document, extracting deadlines, requirements, permit numbers, and
                conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Compliant</h3>
              <p className="text-gray-600">
                Get alerts before deadlines, track compliance status, and never miss a requirement
                again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business. All plans include AI document processing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-2 border-blue-600 shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price.toLocaleString()}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="block mt-6">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by construction professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-gray-600 italic mb-4">
                    "MeritLayer has transformed how we manage compliance. We've cut our admin time
                    in half and haven't missed a deadline since we started using it."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <p className="font-semibold">Project Manager</p>
                      <p className="text-sm text-gray-500">Construction Firm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the waitlist for early access
          </h2>
          <p className="text-blue-100 mb-8">
            Be the first to know when we launch new features and get exclusive early access pricing.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
                required
              />
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white"
              />
            </div>
            <Input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-white max-w-xl mx-auto"
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-bold">MeritLayer</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} MeritLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
