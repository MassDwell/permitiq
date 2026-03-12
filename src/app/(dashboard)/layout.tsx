"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Bell, Settings, Zap, BarChart2, MapPin, Home } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";

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

  return (
    <div className="min-h-screen" style={{ background: '#080D1A' }}>
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64" style={{ background: '#060B17', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-5 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Logo size="md" />
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
                      : "text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)]"
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
              <p className="text-xs font-medium text-[#14B8A6]">Starter Plan</p>
              <p className="text-xs text-[#475569] mt-0.5">3 active projects</p>
            </div>
            {/* User */}
            <div className="flex items-center gap-3 px-2 py-2">
              <UserButton />
              <p className="text-sm font-medium text-[#94A3B8]">Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 pb-16 md:pb-0 min-h-screen" style={{ background: '#080D1A' }}>
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
