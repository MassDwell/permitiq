"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Building2,
  Car,
  Ruler,
  Layers,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static zoning data
// ---------------------------------------------------------------------------

const BOSTON_ZONING: Record<string, {
  name: string;
  allowedUses: string[];
  minLotArea: string;
  maxFAR: string;
  maxHeight: string;
  frontSetback: string;
  sideSetback: string;
  rearSetback: string;
  parkingRequired: string;
  aduAllowed: boolean;
  notes: string;
}> = {
  "R-1": {
    name: "Residential 1-Family",
    allowedUses: ["Single-family dwelling", "Home occupation", "Accessory structures"],
    minLotArea: "6,000 sq ft",
    maxFAR: "0.5",
    maxHeight: "35 ft / 2.5 stories",
    frontSetback: "20 ft",
    sideSetback: "10 ft",
    rearSetback: "30 ft",
    parkingRequired: "1 space per unit",
    aduAllowed: true,
    notes: "ADU allowed by-right under MA ADU law (2024)",
  },
  "R-2": {
    name: "Residential 2-Family",
    allowedUses: ["1-2 family dwelling", "Home occupation", "ADU"],
    minLotArea: "5,000 sq ft",
    maxFAR: "0.8",
    maxHeight: "35 ft / 2.5 stories",
    frontSetback: "15 ft",
    sideSetback: "8 ft",
    rearSetback: "25 ft",
    parkingRequired: "1.5 spaces per unit",
    aduAllowed: true,
    notes: "Common in Dorchester, Roxbury, Mattapan",
  },
  "R-3": {
    name: "Residential 3-Family",
    allowedUses: ["1-3 family dwelling", "ADU", "Home occupation"],
    minLotArea: "5,000 sq ft",
    maxFAR: "1.0",
    maxHeight: "40 ft / 3 stories",
    frontSetback: "10 ft",
    sideSetback: "5 ft",
    rearSetback: "20 ft",
    parkingRequired: "1 space per unit",
    aduAllowed: true,
    notes: "Common in Jamaica Plain, South End",
  },
  "MFR": {
    name: "Multi-Family Residential",
    allowedUses: ["Multi-family dwelling", "Mixed-use with GF retail", "Residential hotel"],
    minLotArea: "3,000 sq ft",
    maxFAR: "2.0",
    maxHeight: "55 ft / 4-5 stories",
    frontSetback: "0-5 ft",
    sideSetback: "0 ft (party wall)",
    rearSetback: "15 ft",
    parkingRequired: "0.75 spaces per unit",
    aduAllowed: true,
    notes: "Typically requires Article 80 review >15,000 GFA",
  },
  "B-1": {
    name: "Local Business",
    allowedUses: ["Retail", "Restaurant", "Personal services", "Mixed-use residential above"],
    minLotArea: "None",
    maxFAR: "2.0",
    maxHeight: "55 ft",
    frontSetback: "0 ft",
    sideSetback: "0 ft",
    rearSetback: "10 ft",
    parkingRequired: "Varies by use",
    aduAllowed: false,
    notes: "Ground floor commercial required",
  },
  "B-2": {
    name: "Community Business",
    allowedUses: ["All B-1 uses", "Supermarket", "Auto service", "Medical office"],
    minLotArea: "None",
    maxFAR: "3.0",
    maxHeight: "65 ft",
    frontSetback: "0 ft",
    sideSetback: "0 ft",
    rearSetback: "10 ft",
    parkingRequired: "1 per 300 GFA retail, varies",
    aduAllowed: false,
    notes: "Common along main corridors",
  },
  "I-1": {
    name: "Light Industrial",
    allowedUses: ["Light manufacturing", "Warehouse", "R&D", "Maker space"],
    minLotArea: "None",
    maxFAR: "2.0",
    maxHeight: "50 ft",
    frontSetback: "20 ft",
    sideSetback: "15 ft",
    rearSetback: "20 ft",
    parkingRequired: "1 per 1000 GFA",
    aduAllowed: false,
    notes: "Residential conversion requires ZBA variance",
  },
};

const NEIGHBORHOOD_ZONING: Record<string, string> = {
  "back bay": "MFR",
  "beacon hill": "R-3",
  "south end": "MFR",
  "south boston": "R-2",
  "southie": "R-2",
  "dorchester": "R-2",
  "roxbury": "R-2",
  "jamaica plain": "R-3",
  "jp": "R-3",
  "roslindale": "R-1",
  "west roxbury": "R-1",
  "hyde park": "R-1",
  "mattapan": "R-2",
  "east boston": "R-2",
  "eastie": "R-2",
  "charlestown": "R-3",
  "allston": "MFR",
  "brighton": "R-2",
  "fenway": "MFR",
  "kenmore": "MFR",
  "mission hill": "R-3",
  "chinatown": "MFR",
  "downtown": "B-2",
  "financial district": "B-2",
  "seaport": "B-2",
  "south boston waterfront": "B-2",
  "innovation district": "B-2",
};

// Known street → neighborhood overrides
const STREET_ZONING: Array<{ pattern: RegExp; zone: string; label: string }> = [
  { pattern: /commonwealth\s+ave/i, zone: "MFR", label: "Commonwealth Ave (Back Bay/Allston)" },
  { pattern: /newbury\s+st/i, zone: "B-1", label: "Newbury St (Back Bay)" },
  { pattern: /boylston\s+st/i, zone: "B-2", label: "Boylston St" },
  { pattern: /tremont\s+st/i, zone: "MFR", label: "Tremont St (South End)" },
  { pattern: /washington\s+st/i, zone: "MFR", label: "Washington St" },
  { pattern: /massachusetts\s+ave/i, zone: "MFR", label: "Massachusetts Ave" },
  { pattern: /blue\s+hill\s+ave/i, zone: "R-2", label: "Blue Hill Ave (Dorchester)" },
  { pattern: /centre\s+st/i, zone: "B-1", label: "Centre St (Jamaica Plain)" },
  { pattern: /cambridge\s+st/i, zone: "B-1", label: "Cambridge St" },
  { pattern: /meridian\s+st/i, zone: "R-2", label: "Meridian St (East Boston)" },
];

// ---------------------------------------------------------------------------
// Lookup logic
// ---------------------------------------------------------------------------

interface LookupResult {
  districtCode: string;
  district: (typeof BOSTON_ZONING)[string];
  matchedOn: string;
  confidence: "high" | "medium" | "low";
}

function lookupZoning(address: string): LookupResult {
  const lower = address.toLowerCase();

  // 1. Check known streets first (most specific)
  for (const { pattern, zone, label } of STREET_ZONING) {
    if (pattern.test(lower)) {
      return {
        districtCode: zone,
        district: BOSTON_ZONING[zone],
        matchedOn: label,
        confidence: "high",
      };
    }
  }

  // 2. Check neighborhood keywords
  for (const [neighborhood, zone] of Object.entries(NEIGHBORHOOD_ZONING)) {
    if (lower.includes(neighborhood)) {
      return {
        districtCode: zone,
        district: BOSTON_ZONING[zone],
        matchedOn: `${neighborhood.replace(/\b\w/g, (c) => c.toUpperCase())} neighborhood`,
        confidence: "high",
      };
    }
  }

  // 3. Default — typical Boston residential
  return {
    districtCode: "R-2",
    district: BOSTON_ZONING["R-2"],
    matchedOn: "Default Boston residential",
    confidence: "low",
  };
}

// ---------------------------------------------------------------------------
// Permit requirement inference
// ---------------------------------------------------------------------------

function getPermitRequirements(code: string): string[] {
  const reqs: string[] = [];
  if (code === "MFR" || code === "B-2") {
    reqs.push("Proposed GFA > 15,000 sq ft → Article 80 Small Project Review required");
    reqs.push("Proposed GFA > 50,000 sq ft → Article 80 Large Project Review required");
  }
  if (code === "B-1" || code === "B-2") {
    reqs.push("Change of use from residential to commercial → ZBA Special Permit required");
  }
  if (code === "I-1") {
    reqs.push("Residential conversion → ZBA Variance required");
    reqs.push("Change of use to residential → ZBA Special Permit required");
  }
  if (["MFR", "B-1", "B-2"].includes(code)) {
    reqs.push("3+ units new construction → BPDA Development Review likely");
  }
  if (["R-1", "R-2", "R-3"].includes(code)) {
    reqs.push("New construction or addition > 1,000 sq ft → ISD Building Permit required");
    reqs.push("ADU up to 900 sq ft → by-right under MA ADU law (2024)");
  }
  reqs.push("All work requires ISD building permit before construction");
  return reqs;
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

const confidenceConfig = {
  high: { label: "High confidence", color: "text-emerald-400", dot: "bg-emerald-400" },
  medium: { label: "Medium confidence", color: "text-amber-400", dot: "bg-amber-400" },
  low: { label: "Estimated — verify with ISD", color: "text-amber-400", dot: "bg-amber-400" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ZoningLookupPage() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleAnalyze() {
    if (!address.trim()) return;
    setResult(lookupZoning(address));
    setSubmitted(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAnalyze();
  }

  const conf = result ? confidenceConfig[result.confidence] : null;
  const permitReqs = result ? getPermitRequirements(result.districtCode) : [];

  return (
    <main className="min-h-screen" style={{ background: "#0F172A" }}>
      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(20,184,166,0.12)",
              color: "#14B8A6",
              border: "1px solid rgba(20,184,166,0.25)",
            }}
          >
            Free Tool — Boston
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Boston Zoning Intelligence
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-2xl mb-10">
          Know exactly what you can build before you spend a dollar. Enter an address and get
          instant zoning classification, height limits, setbacks, FAR, and permit requirements.
        </p>

        {/* Search bar */}
        <div className="flex gap-3">
          <div
            className="flex-1 flex items-center gap-3 px-4 rounded-xl"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <MapPin className="h-5 w-5 text-[#475569] flex-shrink-0" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 123 Dorchester Ave, South Boston"
              className="flex-1 bg-transparent text-white placeholder-[#475569] text-sm py-4 outline-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "#14B8A6",
              color: "#0F172A",
            }}
          >
            <Search className="h-4 w-4" />
            Analyze
          </button>
        </div>

        {/* Example addresses */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-[#475569]">Try:</span>
          {[
            "100 Commonwealth Ave",
            "45 Dorchester Ave",
            "12 Newbury St",
            "88 Seaport Blvd",
            "200 Centre St, Jamaica Plain",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setAddress(ex);
                setResult(lookupZoning(ex));
                setSubmitted(true);
              }}
              className="text-xs px-2.5 py-1 rounded-md transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "#64748B",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Results */}
      {/* ------------------------------------------------------------------ */}
      {submitted && result && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-5">
          {/* District header */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "#14B8A6" }}
                  >
                    {result.districtCode}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    — {result.district.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: conf?.dot === "bg-emerald-400" ? "#10B981" : "#F59E0B" }}
                  />
                  <span className="text-xs" style={{ color: conf?.dot === "bg-emerald-400" ? "#10B981" : "#F59E0B" }}>
                    {conf?.label}
                  </span>
                  <span className="text-xs text-[#475569]">· Matched on: {result.matchedOn}</span>
                </div>
              </div>
              {/* ADU badge */}
              {result.district.aduAllowed ? (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />
                  <span className="text-sm font-semibold" style={{ color: "#10B981" }}>
                    ADU Allowed
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <XCircle className="h-4 w-4" style={{ color: "#EF4444" }} />
                  <span className="text-sm font-semibold" style={{ color: "#EF4444" }}>
                    ADU Not Allowed
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <p className="text-sm text-[#64748B] mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {result.district.notes}
            </p>
          </div>

          {/* What you can build */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
              What You Can Build
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.district.allowedUses.map((use) => (
                <span
                  key={use}
                  className="text-sm px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    background: "rgba(20,184,166,0.08)",
                    color: "#14B8A6",
                    border: "1px solid rgba(20,184,166,0.18)",
                  }}
                >
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Key numbers grid */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-5">
              Key Numbers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Layers, label: "Max FAR", value: result.district.maxFAR },
                { icon: Building2, label: "Max Height", value: result.district.maxHeight },
                { icon: Ruler, label: "Min Lot Area", value: result.district.minLotArea },
                { icon: ArrowRight, label: "Front Setback", value: result.district.frontSetback },
                { icon: ArrowRight, label: "Side Setback", value: result.district.sideSetback },
                { icon: ArrowRight, label: "Rear Setback", value: result.district.rearSetback },
                { icon: Car, label: "Parking Required", value: result.district.parkingRequired },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="h-3.5 w-3.5 text-[#475569]" />
                    <span className="text-xs text-[#475569]">{label}</span>
                  </div>
                  <p className="text-base font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Permit requirements */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
              Permit Requirements
            </h2>
            <div className="space-y-3">
              {permitReqs.map((req) => (
                <div key={req} className="flex items-start gap-3">
                  <AlertCircle
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    style={{ color: "#F59E0B" }}
                  />
                  <p className="text-sm text-[#CBD5E1]">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/sign-up"
              className="flex items-center justify-between p-5 rounded-xl transition-all group"
              style={{
                background: "rgba(20,184,166,0.08)",
                border: "1px solid rgba(20,184,166,0.2)",
              }}
            >
              <div>
                <p className="font-semibold text-white text-sm">Track compliance for this address</p>
                <p className="text-xs text-[#64748B] mt-0.5">Create a project → get deadline alerts</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#14B8A6] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/permits"
              className="flex items-center justify-between p-5 rounded-xl transition-all group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <p className="font-semibold text-white text-sm">View permit guides</p>
                <p className="text-xs text-[#64748B] mt-0.5">ZBA, Article 80, ADU guides</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#475569] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-[#475569] text-center px-4">
            This is a guide based on typical Boston zoning classifications. Always verify the exact
            zoning district with{" "}
            <span className="text-[#64748B]">Boston ISD (Inspectional Services Department)</span>{" "}
            before filing any permit application.
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty state — how it works */}
      {/* ------------------------------------------------------------------ */}
      {!submitted && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Enter an address",
                body: "Any Boston address or neighborhood — we'll identify the most likely zoning district.",
              },
              {
                step: "02",
                title: "Get zoning details",
                body: "See allowed uses, max FAR, height limits, setbacks, and parking requirements instantly.",
              },
              {
                step: "03",
                title: "Know your permits",
                body: "Understand which review processes apply before you spend a dollar on architects or lawyers.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-xl p-5"
                style={{
                  background: "#1E293B",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-3xl font-bold" style={{ color: "rgba(20,184,166,0.3)" }}>
                  {step}
                </span>
                <h3 className="text-white font-semibold mt-2 mb-1">{title}</h3>
                <p className="text-sm text-[#64748B]">{body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
