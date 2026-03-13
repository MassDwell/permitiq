import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ExternalLink, Phone, MapPin, Globe } from "lucide-react";
import {
  PERMIT_RULES,
  PERMIT_GUIDE_ROUTES,
  getJurisdiction,
  getPermitTypeData,
  jurisdictionLabel,
  permitTypeLabel,
} from "@/lib/permit-rules";
import { PermitFeeCalculator } from "@/components/permit-fee-calculator";

type PageParams = { jurisdiction: string; permitType: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  return PERMIT_GUIDE_ROUTES;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { jurisdiction, permitType } = await params;
  const cityName = jurisdictionLabel(jurisdiction);
  const permitName = permitTypeLabel(permitType);
  return {
    title: `${cityName} ${permitName} Requirements | MeritLayer`,
    description: `Complete ${cityName} ${permitName} requirements, fee schedule, checklist, and department contacts. Updated ${PERMIT_RULES.lastUpdated}.`,
    openGraph: {
      title: `${cityName} ${permitName} Requirements`,
      description: `Fees, checklist, and contacts for ${cityName} ${permitName}.`,
    },
  };
}

// Build Article JSON-LD schema
function buildArticleSchema(cityName: string, permitName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${cityName} ${permitName} Requirements`,
    description: `Complete guide to ${cityName} ${permitName} requirements, fee schedule, checklist, and department contacts in Massachusetts.`,
    publisher: {
      "@type": "Organization",
      name: "MeritLayer",
      url: "https://meritlayer.ai",
    },
    author: {
      "@type": "Organization",
      name: "MeritLayer",
    },
    dateModified: new Date(PERMIT_RULES.lastUpdated).toISOString(),
  };
}

// Build the JSON-LD structured data (HowTo schema)
function buildHowToSchema(
  cityName: string,
  permitName: string,
  requirements: Array<{ item: string }>,
  processSteps?: string[]
) {
  const steps = processSteps ?? requirements.map((r) => r.item);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Get a ${cityName} ${permitName}`,
    description: `Step-by-step requirements and process for obtaining a ${cityName} ${permitName} in Massachusetts.`,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };
}

export default async function PermitGuidePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { jurisdiction, permitType } = await params;

  const cityName = jurisdictionLabel(jurisdiction);
  const permitName = permitTypeLabel(permitType);

  // Handle massachusetts as a special case (uses stateWideRules)
  const isStateWide = jurisdiction === "massachusetts";

  const jurisdictionData = isStateWide ? null : getJurisdiction(jurisdiction);
  const permitTypeData = isStateWide ? null : getPermitTypeData(jurisdiction, permitType);
  const stateWideRules = isStateWide ? PERMIT_RULES.stateWideRules : null;

  // Validate route exists
  const routeExists = PERMIT_GUIDE_ROUTES.some(
    (r) => r.jurisdiction === jurisdiction && r.permitType === permitType
  );
  if (!routeExists) notFound();

  // Determine requirements list
  const requirements = isStateWide
    ? stateWideRules!.applicationRequirements.map((r) => ({ item: r.item, sourceUrl: undefined }))
    : (permitTypeData?.requirements ?? permitTypeData?.applicationRequirements ?? []);

  const processSteps = isStateWide
    ? stateWideRules!.processSteps
    : permitTypeData?.processSteps;

  const whatRequiresPermit = isStateWide
    ? stateWideRules!.whatRequiresPermit
    : permitTypeData?.whatRequiresPermit;

  const jsonLd = buildHowToSchema(cityName, permitName, requirements, processSteps);
  const articleJsonLd = buildArticleSchema(cityName, permitName);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-1.5">
          <Link href="/permits" className="hover:text-blue-600 transition-colors">
            Permit Guides
          </Link>
          <span>/</span>
          <Link
            href={`/permits/${jurisdiction}`}
            className="hover:text-blue-600 transition-colors"
          >
            {cityName}
          </Link>
          <span>/</span>
          <span className="text-gray-700">{permitName}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {cityName} {permitName} Requirements
          </h1>
          <p className="text-lg text-gray-600">
            Official requirements, fees, and contacts for obtaining a {permitName.toLowerCase()} in{" "}
            {cityName}, Massachusetts. Last updated {PERMIT_RULES.lastUpdated}.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Department info */}
            {!isStateWide && jurisdictionData && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Department</h2>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <p className="font-semibold text-gray-900">{jurisdictionData.department}</p>
                  {jurisdictionData.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span>{jurisdictionData.address}</span>
                    </div>
                  )}
                  {jurisdictionData.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{jurisdictionData.phone}</span>
                    </div>
                  )}
                  {jurisdictionData.hours && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 text-xs font-medium w-4">🕐</span>
                      <span>{jurisdictionData.hours}</span>
                    </div>
                  )}
                  {jurisdictionData.portal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <a
                        href={jurisdictionData.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Online Permit Portal
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {jurisdictionData.permitFinder && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <a
                        href={jurisdictionData.permitFinder}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Permit Finder / Status
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {/* Key contacts */}
                  {jurisdictionData.keyContacts && jurisdictionData.keyContacts.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        Key Contacts
                      </p>
                      <ul className="space-y-1.5">
                        {jurisdictionData.keyContacts.map((c, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">{c.name}</span>
                            {c.phone && <span className="ml-2 text-gray-500">{c.phone}</span>}
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                className="ml-2 text-blue-600 hover:underline"
                              >
                                {c.email}
                              </a>
                            )}
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-0.5"
                              >
                                Website <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* What requires a permit */}
            {whatRequiresPermit && whatRequiresPermit.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What Requires a {permitName}?
                </h2>
                <ul className="space-y-2">
                  {whatRequiresPermit.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements checklist */}
            {requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements Checklist
                </h2>
                <div className="space-y-3">
                  {requirements.map((req, i) => {
                    const sourceUrl = "sourceUrl" in req ? req.sourceUrl : undefined;
                    const reasoning = "reasoning" in req ? req.reasoning : undefined;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-colors"
                      >
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm">{req.item}</p>
                          {reasoning && (
                            <p className="text-gray-500 text-xs mt-0.5">{reasoning}</p>
                          )}
                          {sourceUrl && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline mt-1 inline-flex items-center gap-0.5"
                            >
                              Source <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Process steps */}
            {processSteps && processSteps.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Process</h2>
                <ol className="space-y-3">
                  {processSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 text-sm pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Additional approvals */}
            {!isStateWide && permitTypeData?.additionalApprovalsRequired && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Additional Approvals Required
                </h2>
                <ul className="space-y-2">
                  {permitTypeData.additionalApprovalsRequired.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-orange-500 mt-0.5">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Resources */}
            {!isStateWide && permitTypeData?.resources && permitTypeData.resources.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
                <ul className="space-y-2">
                  {permitTypeData.resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                      >
                        {r.name} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* MA sources */}
            {isStateWide && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sources</h2>
                <ul className="space-y-2">
                  {PERMIT_RULES.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                      >
                        {s} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fee summary */}
            {!isStateWide && permitTypeData?.fees && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Fee Schedule</h2>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <FeeTable fees={permitTypeData.fees} />
                </div>
              </section>
            )}

            {/* Fee calculator */}
            <PermitFeeCalculator jurisdiction={jurisdiction} permitTypeSlug={permitType} />

            {/* CTA */}
            <div className="bg-gray-900 rounded-xl p-5 text-center">
              <p className="text-white font-semibold mb-1">Track your compliance</p>
              <p className="text-gray-400 text-sm mb-4">
                MeritLayer manages permit checklists, deadlines, and documents for your projects.
              </p>
              <Link
                href="/sign-up"
                className="block w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Simple fee table component
function FeeTable({ fees }: { fees: Record<string, unknown> }) {
  const rows: Array<{ label: string; value: string }> = [];

  function flatten(obj: Record<string, unknown>, prefix = "") {
    for (const [key, val] of Object.entries(obj)) {
      const label = prefix
        ? `${prefix} — ${humanize(key)}`
        : humanize(key);
      if (typeof val === "string") {
        rows.push({ label, value: val });
      } else if (val && typeof val === "object") {
        flatten(val as Record<string, unknown>, label);
      }
    }
  }

  flatten(fees);

  if (rows.length === 0) return null;

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-100 last:border-0">
            <td className="px-4 py-2.5 text-gray-600 align-top leading-snug">{row.label}</td>
            <td className="px-4 py-2.5 text-gray-900 font-medium align-top leading-snug text-right">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function humanize(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
