import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ExternalLink, Phone, MapPin, Globe, ChevronRight } from "lucide-react";
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#080D1A', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-8" style={{ color: '#64748B' }}>
          <Link href="/permits" className="hover:text-[#14B8A6] transition-colors">
            Permit Guides
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span style={{ color: '#94A3B8' }}>{cityName}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-white">{permitName}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            {cityName} {permitName} Requirements
          </h1>
          <p className="text-lg" style={{ color: '#94A3B8' }}>
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
                <h2 className="text-xl font-semibold text-white mb-4">Department</h2>
                <div className="rounded-xl p-5 space-y-3" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-semibold text-white">{jurisdictionData.department}</p>
                  {jurisdictionData.address && (
                    <div className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#475569' }} />
                      <span>{jurisdictionData.address}</span>
                    </div>
                  )}
                  {jurisdictionData.phone && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#475569' }} />
                      <span>{jurisdictionData.phone}</span>
                    </div>
                  )}
                  {jurisdictionData.hours && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <span style={{ color: '#475569' }} className="text-xs font-medium w-4">🕐</span>
                      <span>{jurisdictionData.hours}</span>
                    </div>
                  )}
                  {jurisdictionData.portal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 flex-shrink-0" style={{ color: '#14B8A6' }} />
                      <a
                        href={jurisdictionData.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                        style={{ color: '#14B8A6' }}
                      >
                        Online Permit Portal
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {jurisdictionData.permitFinder && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 flex-shrink-0" style={{ color: '#14B8A6' }} />
                      <a
                        href={jurisdictionData.permitFinder}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                        style={{ color: '#14B8A6' }}
                      >
                        Permit Finder / Status
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {/* Key contacts */}
                  {jurisdictionData.keyContacts && jurisdictionData.keyContacts.length > 0 && (
                    <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: '#475569' }}>
                        Key Contacts
                      </p>
                      <ul className="space-y-1.5">
                        {jurisdictionData.keyContacts.map((c, i) => (
                          <li key={i} className="text-sm" style={{ color: '#94A3B8' }}>
                            <span className="font-medium text-white">{c.name}</span>
                            {c.phone && <span className="ml-2" style={{ color: '#64748B' }}>{c.phone}</span>}
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                className="ml-2 hover:underline"
                                style={{ color: '#14B8A6' }}
                              >
                                {c.email}
                              </a>
                            )}
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 hover:underline inline-flex items-center gap-0.5"
                                style={{ color: '#14B8A6' }}
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
                <h2 className="text-xl font-semibold text-white mb-4">
                  What Requires a {permitName}?
                </h2>
                <ul className="space-y-2">
                  {whatRequiresPermit.map((item, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: '#94A3B8' }}>
                      <CheckCircle className="h-4 w-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements checklist */}
            {requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Requirements Checklist
                </h2>
                <div className="space-y-3">
                  {requirements.map((req, i) => {
                    const sourceUrl = "sourceUrl" in req ? req.sourceUrl : undefined;
                    const reasoning = "reasoning" in req ? req.reasoning : undefined;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}
                      >
                        <div className="mt-0.5 h-5 w-5 rounded-full flex-shrink-0" style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{req.item}</p>
                          {reasoning && (
                            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{reasoning}</p>
                          )}
                          {sourceUrl && (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:underline mt-1 inline-flex items-center gap-0.5"
                              style={{ color: '#14B8A6' }}
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
                <h2 className="text-xl font-semibold text-white mb-4">Application Process</h2>
                <ol className="space-y-3">
                  {processSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}>
                        {i + 1}
                      </div>
                      <p className="text-sm pt-0.5" style={{ color: '#94A3B8' }}>{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Additional approvals */}
            {!isStateWide && permitTypeData?.additionalApprovalsRequired && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Additional Approvals Required
                </h2>
                <ul className="space-y-2">
                  {permitTypeData.additionalApprovalsRequired.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <span className="text-amber-400 mt-0.5">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Resources */}
            {!isStateWide && permitTypeData?.resources && permitTypeData.resources.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Resources</h2>
                <ul className="space-y-2">
                  {permitTypeData.resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline inline-flex items-center gap-1"
                        style={{ color: '#14B8A6' }}
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
                <h2 className="text-xl font-semibold text-white mb-4">Sources</h2>
                <ul className="space-y-2">
                  {PERMIT_RULES.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline inline-flex items-center gap-1"
                        style={{ color: '#14B8A6' }}
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
                <h2 className="text-lg font-semibold text-white mb-3">Fee Schedule</h2>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D1525' }}>
                  <FeeTable fees={permitTypeData.fees} />
                </div>
              </section>
            )}

            {/* Fee calculator */}
            <PermitFeeCalculator jurisdiction={jurisdiction} permitTypeSlug={permitType} />

            {/* CTA */}
            <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)', border: '1px solid rgba(20,184,166,0.25)' }}>
              <p className="text-white font-semibold mb-1">Track your compliance</p>
              <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                MeritLayer manages permit checklists, deadlines, and documents for your projects.
              </p>
              <Link
                href="/sign-up"
                className="block w-full text-sm font-medium py-2.5 rounded-lg transition-colors"
                style={{ background: '#14B8A6', color: '#080D1A' }}
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
          <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <td className="px-4 py-2.5 align-top leading-snug" style={{ color: '#94A3B8' }}>{row.label}</td>
            <td className="px-4 py-2.5 font-medium align-top leading-snug text-right text-white">
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
