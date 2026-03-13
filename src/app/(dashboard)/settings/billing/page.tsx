"use client";

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ExternalLink,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Lock,
} from "lucide-react";
import { useIsOwner } from "@/hooks/use-is-owner";

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["1 active project", "100 documents/month", "AI document processing", "Deadline alerts", "Email support"],
  professional: ["5 active projects", "Unlimited documents", "AI document processing", "Priority deadline alerts", "Compliance reports", "Priority support"],
  enterprise: ["Unlimited projects", "Unlimited documents", "Custom compliance rules", "API access", "Dedicated account manager", "SLA guarantee"],
};

const PLAN_PRICES: Record<string, string> = {
  starter: "Free",
  professional: "$24.99/mo",
  enterprise: "$49.99/mo",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;

  switch (status) {
    case "active":
      return (
        <Badge className="gap-1" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
          <CheckCircle className="h-3 w-3" /> Active
        </Badge>
      );
    case "trialing":
      return (
        <Badge className="gap-1" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}>
          <Clock className="h-3 w-3" /> Trialing
        </Badge>
      );
    case "past_due":
      return (
        <Badge className="gap-1" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}>
          <AlertTriangle className="h-3 w-3" /> Past Due
        </Badge>
      );
    case "canceled":
      return (
        <Badge className="gap-1" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
          <XCircle className="h-3 w-3" /> Canceled
        </Badge>
      );
    default:
      return (
        <Badge style={{ background: "rgba(255,255,255,0.08)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.12)" }}>
          {status}
        </Badge>
      );
  }
}

function PlanBadge({ plan }: { plan: string }) {
  switch (plan) {
    case "professional":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}>
          Professional
        </span>
      );
    case "enterprise":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(168,85,247,0.15)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.3)" }}>
          Enterprise
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.3)" }}>
          Starter
        </span>
      );
  }
}

const CARD_STYLE = {
  background: "#0E1525",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

const SECTION_HEADER_STYLE = {
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

export default function BillingPage() {
  const { data: profile, isLoading: profileLoading } = trpc.settings.getProfile.useQuery();
  const { data: subscription, isLoading: subscriptionLoading } = trpc.billing.getSubscription.useQuery();
  const { isOwner, ownerEmail, isLoading: ownerLoading } = useIsOwner();

  const createPortalSession = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const plan = profile?.plan ?? "starter";
  const isLoading = profileLoading || subscriptionLoading;

  // Collaborator-only users cannot access billing
  if (!ownerLoading && !isOwner) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Billing</h1>
          <p className="text-[#64748B] mt-1">Manage your subscription and billing details</p>
        </div>
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(100,116,139,0.1)" }}
          >
            <Lock className="h-7 w-7 text-[#475569]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">Billing is managed by the account owner</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            You have collaborator access to this workspace. Subscription and billing details are only visible to the
            account owner.
          </p>
          {ownerEmail && (
            <p className="text-sm text-[#475569] mt-4">
              Contact{" "}
              <span className="text-[#94A3B8] font-medium">{ownerEmail}</span>{" "}
              to make changes.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9]">Billing</h1>
        <p className="text-[#64748B] mt-1">Manage your subscription and billing details</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Current Plan</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Your active subscription</p>
          </div>
          <div className="px-6 py-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PlanBadge plan={plan} />
                    <span className="text-2xl font-bold text-[#F1F5F9]">
                      {PLAN_PRICES[plan] ?? "—"}
                    </span>
                    {profile?.subscriptionStatus && (
                      <StatusBadge status={profile.subscriptionStatus} />
                    )}
                  </div>

                  {profile?.subscriptionPeriodEnd && (
                    <p className="text-sm text-[#64748B]">
                      {profile.subscriptionStatus === "canceled"
                        ? "Access ends"
                        : "Renews"}{" "}
                      on{" "}
                      <span className="text-[#94A3B8] font-medium">
                        {new Date(profile.subscriptionPeriodEnd).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  )}

                  {/* Subscription from billing query */}
                  {!profile?.subscriptionPeriodEnd && subscription?.currentPeriodEnd && (
                    <p className="text-sm text-[#64748B]">
                      {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
                      <span className="text-[#94A3B8] font-medium">
                        {subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  )}

                  {subscription?.cancelAtPeriodEnd && (
                    <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                      <p className="text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Your subscription will cancel at the end of the billing period.
                      </p>
                    </div>
                  )}

                  {/* Features list */}
                  <div className="pt-2 space-y-1.5">
                    {(PLAN_FEATURES[plan] ?? []).map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#64748B]">
                        <CheckCircle className="h-3.5 w-3.5 text-[#14B8A6] shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {plan !== "starter" ? (
                    <Button
                      variant="outline"
                      onClick={() => createPortalSession.mutate()}
                      disabled={createPortalSession.isPending}
                      style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94A3B8" }}
                      className="hover:bg-white/5 whitespace-nowrap"
                    >
                      {createPortalSession.isPending ? "Loading..." : "Manage Subscription"}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      style={{ background: "#14B8A6", color: "#080D1A" }}
                      className="hover:bg-[#0D9488] font-semibold whitespace-nowrap"
                    >
                      <a href="/pricing">
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade Plan
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Portal */}
        {plan !== "starter" && (
          <div style={CARD_STYLE}>
            <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="text-base font-semibold text-[#F1F5F9]">Payment & Invoices</h2>
              </div>
              <p className="text-sm text-[#475569] mt-0.5">Manage payment methods and view invoices</p>
            </div>
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[#94A3B8] text-sm">
                  Access your full billing history, update your payment method, or cancel your subscription via the Stripe portal.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => createPortalSession.mutate()}
                disabled={createPortalSession.isPending}
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94A3B8" }}
                className="hover:bg-white/5 ml-6 shrink-0"
              >
                {createPortalSession.isPending ? "Loading..." : "Open Billing Portal"}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Upgrade CTA for Starter */}
        {plan === "starter" && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#F1F5F9] mb-1">Ready to unlock more?</h3>
                <p className="text-sm text-[#64748B] mb-4 max-w-md">
                  Upgrade to Professional for 5 projects, unlimited documents, compliance reports, and team collaboration.
                </p>
                <div className="space-y-1.5">
                  {PLAN_FEATURES.professional.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[#64748B]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#14B8A6] shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                asChild
                style={{ background: "#14B8A6", color: "#080D1A" }}
                className="hover:bg-[#0D9488] font-semibold shrink-0"
              >
                <a href="/pricing">
                  Upgrade Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
