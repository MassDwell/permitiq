"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FolderOpen, FileText, DollarSign, Activity, Shield } from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { name: "Activity Feed", href: "/admin/activity", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      {/* Sidebar */}
      <div
        className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col"
        style={{ background: "#1E293B", borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Logo */}
        <Link href="/">
          <div
            className="flex items-center gap-2.5 px-5 h-16 shrink-0 hover:opacity-80 transition-opacity"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Shield className="h-5 w-5 text-[#14B8A6]" />
            <span className="text-white font-semibold text-sm">MeritLayer Admin</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navigation.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
                style={isActive ? { boxShadow: "inset 2px 0 0 #14B8A6" } : {}}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#14B8A6]" : "")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserButton />
            <p className="text-sm font-medium text-[#94A3B8]">Admin</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 min-h-screen" style={{ background: "#0F172A" }}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
