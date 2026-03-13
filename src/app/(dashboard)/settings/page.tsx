"use client";

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  CreditCard,
  ExternalLink,
  Building2,
  Zap,
  ArrowRight,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useIsOwner } from "@/hooks/use-is-owner";

const CARD_STYLE = {
  background: '#1E293B',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16,
};

const SECTION_HEADER_STYLE = {
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

function PlanBadge({ plan }: { plan: string }) {
  switch (plan) {
    case "professional":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}>
          Professional
        </span>
      );
    case "enterprise":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.3)' }}>
          Enterprise
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(20,184,166,0.12)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}>
          Starter
        </span>
      );
  }
}

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const [copied, setCopied] = useState(false);
  const { isOwner } = useIsOwner();

  const { data: profile, isLoading: profileLoading } =
    trpc.settings.getProfile.useQuery();
  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();
  const { data: subscription, isLoading: subscriptionLoading } =
    trpc.billing.getSubscription.useQuery();
  const { data: referralData, isLoading: referralLoading } =
    trpc.referrals.getMyCode.useQuery();

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Settings updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPortalSession = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = profileLoading || settingsLoading;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9]">Settings</h1>
        <p className="text-[#64748B] mt-1">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Account</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Your account information</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-64" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#475569] text-xs uppercase tracking-wide">Name</Label>
                    <p className="font-medium text-[#F1F5F9] mt-0.5">{profile?.name || "Not set"}</p>
                  </div>
                </div>
                <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#475569] text-xs uppercase tracking-wide">Email</Label>
                    <p className="font-medium text-[#F1F5F9] mt-0.5">{profile?.email}</p>
                  </div>
                </div>
                <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#475569] text-xs uppercase tracking-wide">Plan</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <PlanBadge plan={profile?.plan ?? "starter"} />
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() => createPortalSession.mutate()}
                      disabled={createPortalSession.isPending}
                      style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8' }}
                      className="hover:bg-white/5"
                    >
                      {createPortalSession.isPending ? "Loading..." : "Manage Subscription"}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Billing — owner only */}
        {isOwner && <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Billing</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Manage your subscription and billing</p>
          </div>
          <div className="px-6 py-5">
            {subscriptionLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#475569] text-xs uppercase tracking-wide">Status</Label>
                    <p className="font-medium text-[#F1F5F9] mt-0.5 capitalize">{subscription.status}</p>
                  </div>
                  <div>
                    <Label className="text-[#475569] text-xs uppercase tracking-wide">Renews</Label>
                    <p className="font-medium text-[#F1F5F9] mt-0.5">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <p className="text-sm text-amber-400">
                      Your subscription will cancel at the end of the current billing period.
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => createPortalSession.mutate()}
                  disabled={createPortalSession.isPending}
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8' }}
                  className="hover:bg-white/5"
                >
                  {createPortalSession.isPending ? "Loading..." : "Manage Billing"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#94A3B8] font-medium">Starter Plan</p>
                  <p className="text-sm text-[#475569] mt-0.5">
                    You&apos;re on the free Starter plan. Upgrade for more projects, AI chat, and team collaboration.
                  </p>
                </div>
                <Button
                  asChild
                  style={{ background: '#14B8A6', color: '#0F172A' }}
                  className="hover:bg-[#0D9488] shrink-0 ml-4"
                >
                  <a href="/pricing">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>}

        {/* Notification Settings */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Notifications</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Configure how you receive deadline alerts</p>
          </div>
          <div className="px-6 py-5 space-y-6">
            {settingsLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#F1F5F9]">Email Alerts</Label>
                    <p className="text-sm text-[#475569]">
                      Receive email notifications for upcoming deadlines
                    </p>
                  </div>
                  <Switch
                    checked={settings?.emailAlerts ?? true}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ emailAlerts: checked })
                    }
                  />
                </div>

                <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#F1F5F9]">Alert Lead Time</Label>
                    <p className="text-sm text-[#475569]">
                      How many days before a deadline to start alerting
                    </p>
                  </div>
                  <Select
                    value={String(settings?.alertLeadDays ?? 7)}
                    onValueChange={(value) =>
                      updateSettings.mutate({ alertLeadDays: parseInt(value) })
                    }
                  >
                    <SelectTrigger
                      className="w-32"
                      style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[#F1F5F9]">Daily Digest</Label>
                    <p className="text-sm text-[#475569]">
                      Receive a daily summary of all upcoming deadlines
                    </p>
                  </div>
                  <Switch
                    checked={settings?.dailyDigest ?? false}
                    onCheckedChange={(checked) =>
                      updateSettings.mutate({ dailyDigest: checked })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Invite a Colleague */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Invite a Colleague</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Share MeritLayer with your team</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {referralLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div>
                  <Label className="text-[#475569] text-xs uppercase tracking-wide">Your Referral Link</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      readOnly
                      value={referralData?.referralLink ?? ""}
                      className="flex-1 text-sm"
                      style={{
                        background: '#141C2E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94A3B8',
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (referralData?.referralLink) {
                          navigator.clipboard.writeText(referralData.referralLink);
                          setCopied(true);
                          toast.success("Referral link copied!");
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8' }}
                      className="hover:bg-white/5 shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
                  <div className="text-2xl font-bold text-[#14B8A6]">{referralData?.referralCount ?? 0}</div>
                  <p className="text-sm text-[#64748B]">
                    colleague{(referralData?.referralCount ?? 0) !== 1 ? "s" : ""} joined using your link
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Integrations Placeholder */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Integrations</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">Connect with other tools</p>
          </div>
          <div className="px-6 py-10 text-center">
            <p className="text-[#475569]">Integrations coming soon</p>
            <p className="text-sm text-[#334155] mt-1">
              Connect MeritLayer with Procore, Buildertrend, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
