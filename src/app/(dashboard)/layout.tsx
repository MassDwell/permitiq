"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Bell, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: unreadCount } = trpc.alerts.getUnreadCount.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0F1E] border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 h-16 border-b border-white/10">
            <Logo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "border-l-2 border-primary text-primary bg-primary/10 pl-[10px]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                  {item.name === "Alerts" && unreadCount && unreadCount > 0 ? (
                    <span className="ml-auto bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <UserButton />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Account</p>
                <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
                  Starter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
