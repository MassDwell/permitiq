"use client";

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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } =
    trpc.settings.getProfile.useQuery();
  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();
  const { data: subscription, isLoading: subscriptionLoading } =
    trpc.billing.getSubscription.useQuery();

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

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "starter":
        return <Badge variant="secondary">Starter</Badge>;
      case "professional":
        return <Badge className="bg-blue-100 text-blue-800">Professional</Badge>;
      case "enterprise":
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const isLoading = profileLoading || settingsLoading;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-64" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500">Name</Label>
                    <p className="font-medium">{profile?.name || "Not set"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500">Plan</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getPlanBadge(profile?.plan || "starter")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => createPortalSession.mutate()}
                    disabled={createPortalSession.isPending}
                  >
                    Manage Subscription
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive deadline alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-gray-500">
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert Lead Time</Label>
                    <p className="text-sm text-gray-500">
                      How many days before a deadline to start alerting
                    </p>
                  </div>
                  <Select
                    value={String(settings?.alertLeadDays ?? 7)}
                    onValueChange={(value) =>
                      updateSettings.mutate({ alertLeadDays: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-32">
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-gray-500">
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
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <CardTitle>Billing</CardTitle>
            </div>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <p className="font-medium capitalize">{subscription.status}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Renews</Label>
                    <p className="font-medium">
                      {subscription.currentPeriodEnd.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will cancel at the end of the current
                      billing period.
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => createPortalSession.mutate()}
                  disabled={createPortalSession.isPending}
                >
                  Manage Billing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  You're on the free Starter plan. Upgrade for more features.
                </p>
                <Button asChild>
                  <a href="/pricing">View Plans</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrations Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <CardTitle>Integrations</CardTitle>
            </div>
            <CardDescription>Connect with other tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">
                Integrations coming soon
              </p>
              <p className="text-sm text-gray-400">
                Connect PermitIQ with Procore, Buildertrend, and more
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
