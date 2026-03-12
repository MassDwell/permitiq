import Link from "next/link";
import { Building2 } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-gray-900">MeritLayer</span>
              </Link>
              <Link
                href="/permits"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Permit Guides
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t py-8 mt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">MeritLayer</span>
              <span className="text-gray-400 text-sm">AI-powered permit compliance for MA developers</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MeritLayer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
