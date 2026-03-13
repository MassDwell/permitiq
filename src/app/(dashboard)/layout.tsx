"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Bell, Settings, Zap, BarChart2, MapPin, Home, LogOut } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { OnboardingModal } from "@/components/onboarding-modal";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/portfolio", icon: BarChart2 },
  { name: "Zoning Lookup", href: "/tools/zoning-lookup", icon: MapPin },
  { name: "ADU Tools", href: "/tools/adu-eligibility", icon: Home },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Upgrade Plan", href: "/pricing", icon: Zap },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: unreadCount } = trpc.alerts.getUnreadCount.useQuery();
  const { data: profile } = trpc.settings.getProfile.useQuery();

  const planLabel = profile?.plan
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : "Starter";

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64" style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-5 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-[#14B8A6] bg-[rgba(20,184,166,0.1)]"
                      : "text-[#CBD5E1] hover:text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.03)]"
                  )}
                  style={isActive ? { boxShadow: 'inset 2px 0 0 #14B8A6' } : {}}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#14B8A6]" : "")} />
                  {item.name}
                  {item.name === "Alerts" && unreadCount && unreadCount > 0 ? (
                    <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 pb-4 space-y-2">
            {/* Plan badge */}
            <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
              <p className="text-xs font-medium text-[#14B8A6]">{planLabel} Plan</p>
              <p className="text-xs text-[#475569] mt-0.5">
                {/* AUDIT-FIX: Updated sidebar labels to match pricing page (3 / 10 / unlimited) */}
              {profile?.plan === "starter" ? "Up to 3 projects" : profile?.plan === "professional" ? "Up to 10 projects" : "Unlimited projects"}
              </p>
            </div>
            {/* User */}
            <div className="flex items-center gap-3 px-2 py-2">
              <UserButton />
              <p className="text-sm font-medium text-[#E2E8F0]">Account</p>
            </div>
            {/* Sign Out */}
            <SignOutButton>
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-[#CBD5E1] hover:text-red-400 hover:bg-[rgba(239,68,68,0.05)]">
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 pb-16 md:pb-0 min-h-screen" style={{ background: '#0F172A' }}>
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Onboarding modal — shown when onboardingCompleted is false */}
      {profile && !profile.onboardingCompleted && (
        <OnboardingModal userName={profile.name} />
      )}
    </div>
  );
}
