import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PublicNavAuth } from "@/components/public-nav-auth";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080D1A", color: "#F1F5F9" }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{ background: "rgba(6,11,23,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Logo size="md" />
              </Link>
              <Link
                href="/permits"
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Permit Guides
              </Link>
              <Link
                href="/tools/soft-costs-calculator"
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Soft Costs
              </Link>
              <Link
                href="/tools/zoning-lookup"
                className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Zoning Lookup
              </Link>
            </div>
            <PublicNavAuth />
          </div>
        </div>
      </nav>
      {children}
      <footer
        className="py-8 mt-16"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#060B17" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-sm" style={{ color: "#475569" }}>
                AI-powered permit compliance for MA developers
              </span>
            </div>
            <p className="text-sm" style={{ color: "#475569" }}>
              &copy; {new Date().getFullYear()} MeritLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
