import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { PERMIT_GUIDE_ROUTES, jurisdictionLabel, permitTypeLabel, getJurisdiction } from "@/lib/permit-rules";

export const metadata: Metadata = {
  title: "Massachusetts Permit Guides | MeritLayer",
  description:
    "Free permit requirement guides for Boston, Cambridge, Brookline, Salem, Lowell, and Springfield. Fee schedules, checklists, and department contacts — all in one place.",
};

// Group routes by jurisdiction
const routesByJurisdiction = PERMIT_GUIDE_ROUTES.reduce<
  Record<string, typeof PERMIT_GUIDE_ROUTES>
>((acc, route) => {
  if (!acc[route.jurisdiction]) acc[route.jurisdiction] = [];
  acc[route.jurisdiction].push(route);
  return acc;
}, {});

export default function PermitsIndexPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="text-sm font-medium text-blue-600 mb-2">Free Permit Guides</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Massachusetts Permit Requirements
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Detailed permit checklists, fee schedules, and department contacts for every major
          Massachusetts city — sourced directly from official building departments.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(routesByJurisdiction).map(([jurisdiction, routes]) => {
          const j = jurisdiction !== "massachusetts" ? getJurisdiction(jurisdiction) : null;
          return (
            <div key={jurisdiction}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {jurisdictionLabel(jurisdiction)}
                </h2>
                {j?.department && (
                  <span className="text-sm text-gray-400">— {j.department}</span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {routes.map((route) => (
                  <Link
                    key={`${route.jurisdiction}-${route.permitType}`}
                    href={`/permits/${route.jurisdiction}/${route.permitType}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {jurisdictionLabel(jurisdiction)} {permitTypeLabel(route.permitType)}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Requirements, fees &amp; contacts
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Managing multiple projects?
        </h2>
        <p className="text-blue-100 mb-6">
          MeritLayer tracks permit requirements, deadlines, and compliance across all your
          Massachusetts projects — with AI-powered document processing and proactive alerts.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Start Free Trial
        </Link>
      </div>
    </main>
  );
}
