"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";

const pricingPlans = [
  {
    id: "starter" as const,
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
    id: "professional" as const,
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
    id: "enterprise" as const,
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

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  const createCheckout = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "cancelled") {
      toast.info("Checkout cancelled");
    }
  }, [searchParams]);

  const handleSelectPlan = (planId: "starter" | "professional" | "enterprise") => {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }
    createCheckout.mutate({ plan: planId });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white/20 hover:bg-white/5">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All plans include AI-powered document processing and deadline alerts.
            Choose the plan that fits your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-card rounded-xl transition-all ${
                plan.popular
                  ? "border-primary border-2"
                  : "border border-white/10 hover:border-white/20"
              }`}
              style={plan.popular ? { boxShadow: "0 0 30px rgba(20,184,166,0.15)" } : {}}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">
                    ${plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-white/20 hover:bg-white/5"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Loading..." : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Enterprise needs?
          </h2>
          <p className="text-muted-foreground mb-6">
            Custom compliance rules, dedicated support, and API access for
            large-scale operations.
          </p>
          <Button variant="outline" size="lg" className="border-white/20 hover:bg-white/5">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
