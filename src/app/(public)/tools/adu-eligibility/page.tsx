"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, CheckCircle, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";
import ADURoiCalculator from "@/components/adu-roi-calculator";

const MA_MUNICIPALITIES = [
  "Boston", "Cambridge", "Somerville", "Brookline", "Newton", "Quincy",
  "Lynn", "Lowell", "Worcester", "Springfield", "Salem", "Medford",
  "Malden", "Waltham", "Brockton", "Framingham", "Haverhill", "Revere",
  "Peabody", "Methuen", "Taunton", "Weymouth", "New Bedford", "Fall River",
  "Other Massachusetts Town/City",
];

interface FormData {
  municipality: string;
  zoningDistrict: string;
  structureType: string;
  lotSizeSqft: string;
  primaryStructureSqft: string;
  ownerOccupied: string;
}

interface EligibilityResult {
  eligible: boolean | "maybe";
  reason?: string;
  maxADUSize?: number;
  notes?: string[];
  massDwellModels?: { name: string; size: number; bedBath: string; price: number }[];
}

const MASSDWELL_MODELS = [
  { name: "Dwell Essential", size: 470, bedBath: "1/1", price: 141000 },
  { name: "Dwell Classic", size: 565, bedBath: "2/1", price: 172000 },
  { name: "Dwell Deluxe", size: 594, bedBath: "2/1", price: 186000 },
  { name: "Dwell Prime", size: 892, bedBath: "2/2", price: 270000 },
];

function checkADUEligibility(data: FormData): EligibilityResult {
  // 2024 MA ADU Law (Chapter 150 of the Acts of 2024 / GL c.40A s.3J)
  const eligibleStructures = ["single-family", "two-family"];
  const eligibleZones = ["R-1", "R-2", "R-3"];

  if (!eligibleStructures.includes(data.structureType)) {
    return {
      eligible: false,
      reason: "By-right ADU applies to single-family and two-family homes only. Other structure types may require a variance.",
    };
  }

  if (!eligibleZones.includes(data.zoningDistrict)) {
    return {
      eligible: "maybe",
      reason: `Your zoning district (${data.zoningDistrict}) may allow ADUs under local bylaws — but the statewide by-right provision applies specifically to residential zones. Check with your local building department.`,
    };
  }

  const primarySqft = parseFloat(data.primaryStructureSqft) || 0;
  const maxADUSize = primarySqft > 0 ? Math.min(900, primarySqft * 0.5) : 900;

  const notes: string[] = [];
  if (data.structureType === "two-family") {
    notes.push(
      "Two-family homes are included under the 2024 law, but some municipalities may have adopted local bylaws — verify with your town building department."
    );
  }
  if (data.municipality !== "Boston" && data.municipality !== "") {
    notes.push(
      `${data.municipality} may have adopted local ADU bylaws that are more permissive than the state baseline. Check with your local building department for town-specific rules.`
    );
  }

  return {
    eligible: true,
    maxADUSize,
    notes,
    massDwellModels: MASSDWELL_MODELS.filter((m) => m.size <= maxADUSize),
  };
}

const INITIAL_FORM: FormData = {
  municipality: "",
  zoningDistrict: "",
  structureType: "",
  lotSizeSqft: "",
  primaryStructureSqft: "",
  ownerOccupied: "",
};

export default function ADUEligibilityPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ name: string; size: number; bedBath: string; price: number } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = checkADUEligibility(form);
    setResult(r);
    setSelectedModel(r.massDwellModels?.[1] ?? r.massDwellModels?.[0] ?? null);
    setTimeout(() => {
      document.getElementById("adu-results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  }

  const selectClass =
    "w-full px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-1 appearance-none";
  const selectStyle = {
    background: "#0E1525",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="min-h-screen" style={{ background: "#080D1A" }}>
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="mb-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.25)" }}
          >
            <Home className="h-3.5 w-3.5" />
            Free Tool — No Account Required
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">
          Massachusetts ADU Eligibility Checker
        </h1>
        <p className="text-lg" style={{ color: "#94A3B8" }}>
          Is your property eligible for a by-right ADU under the 2024 MA ADU Law?
          Get an instant answer based on{" "}
          <span className="text-white font-medium">Chapter 150 of the Acts of 2024 (GL c.40A §3J)</span>.
        </p>

        {/* Law badge */}
        <div
          className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.18)" }}
        >
          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#14B8A6" }} />
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            <span className="text-white font-medium">The 2024 MA ADU Law</span> is the biggest zoning
            reform in Massachusetts in 50 years. Every single-family and two-family home in MA now has
            by-right ADU access — no ZBA hearing, no special permit, no owner-occupancy requirement.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: "#0E1525", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-base font-semibold text-white mb-5">Step 1 — Property Basics</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Municipality */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                City / Town
              </label>
              <select
                required
                value={form.municipality}
                onChange={(e) => handleChange("municipality", e.target.value)}
                className={selectClass}
                style={selectStyle}
              >
                <option value="">Select a municipality…</option>
                {MA_MUNICIPALITIES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Zoning district */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                Zoning District
              </label>
              <select
                required
                value={form.zoningDistrict}
                onChange={(e) => handleChange("zoningDistrict", e.target.value)}
                className={selectClass}
                style={selectStyle}
              >
                <option value="">Select…</option>
                <option value="R-1">R-1 (Single-family residential)</option>
                <option value="R-2">R-2 (Residential)</option>
                <option value="R-3">R-3 (Multi-family residential)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Structure type */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                Existing Structure Type
              </label>
              <select
                required
                value={form.structureType}
                onChange={(e) => handleChange("structureType", e.target.value)}
                className={selectClass}
                style={selectStyle}
              >
                <option value="">Select…</option>
                <option value="single-family">Single-family</option>
                <option value="two-family">Two-family</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Lot size */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                Lot Size (sq ft)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 6000"
                value={form.lotSizeSqft}
                onChange={(e) => handleChange("lotSizeSqft", e.target.value)}
                className={selectClass}
                style={selectStyle}
              />
            </div>

            {/* Primary structure sq ft */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                Primary Structure (sq ft)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1800"
                value={form.primaryStructureSqft}
                onChange={(e) => handleChange("primaryStructureSqft", e.target.value)}
                className={selectClass}
                style={selectStyle}
              />
              <p className="text-xs mt-1" style={{ color: "#475569" }}>Used to calculate max ADU size (50% rule)</p>
            </div>

            {/* Owner occupied */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                Currently owner-occupied?
              </label>
              <div className="flex gap-3">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange("ownerOccupied", opt)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={
                      form.ownerOccupied === opt
                        ? { background: "rgba(20,184,166,0.15)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.4)" }
                        : { background: "#0E1525", color: "#64748B", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
                Note: Owner-occupancy is <span className="text-white">no longer required</span> under the 2025 amendment.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "#14B8A6", color: "#080D1A" }}
          >
            Check My Eligibility →
          </button>
        </form>

        {/* Results */}
        {result && (
          <div id="adu-results" className="mt-8">
            {result.eligible === true && (
              <div>
                {/* Eligible card */}
                <div
                  className="rounded-2xl p-6 sm:p-8 mb-6"
                  style={{ background: "#0E1525", border: "1px solid rgba(20,184,166,0.3)" }}
                >
                  <div className="flex items-start gap-3 mb-6">
                    <CheckCircle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#14B8A6" }} />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Your property is likely eligible for a by-right ADU
                      </h2>
                      <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                        Under MA General Laws Chapter 40A, Section 3J (2024), your property qualifies for an
                        accessory dwelling unit without a variance or special permit.
                      </p>
                    </div>
                  </div>

                  {/* ADU size */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}
                  >
                    <p className="text-sm font-semibold text-white mb-2">📐 Your ADU Size Limits</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "#94A3B8" }}>Maximum ADU size</span>
                      <span className="font-bold text-white">{result.maxADUSize?.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm" style={{ color: "#94A3B8" }}>Calculation basis</span>
                      <span className="text-sm" style={{ color: "#94A3B8" }}>min(900 sqft, 50% of primary)</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white mb-3">📋 Key Requirements</p>
                    <div className="space-y-2">
                      {[
                        "No owner-occupancy requirement (as of 2025 amendment)",
                        "No additional parking required beyond existing",
                        "Must meet building code and local zoning setbacks",
                        "Building permit required — no ZBA hearing needed",
                        "Must be on same lot as primary dwelling",
                      ].map((req) => (
                        <div key={req} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#14B8A6" }} />
                          <span className="text-sm" style={{ color: "#94A3B8" }}>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "#060B17", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-sm font-semibold text-white mb-2">⏱ Typical Timeline</p>
                    <div className="space-y-1 text-sm" style={{ color: "#94A3B8" }}>
                      <div className="flex justify-between">
                        <span>Permitting (Boston ISD)</span>
                        <span className="text-white">4–8 weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Construction (factory-built modular)</span>
                        <span className="text-white">8–12 weeks</span>
                      </div>
                      <div
                        className="flex justify-between pt-2 mt-1 font-medium"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span>Total</span>
                        <span style={{ color: "#14B8A6" }}>3–5 months</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost estimate */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "#060B17", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-sm font-semibold text-white mb-2">💰 Estimated Investment</p>
                    <div className="space-y-1 text-sm" style={{ color: "#94A3B8" }}>
                      <div className="flex justify-between">
                        <span>Site-built ADU</span>
                        <span className="text-white">$180,000 – $350,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Modular ADU (MassDwell)</span>
                        <span style={{ color: "#14B8A6" }} className="font-medium">Starting at $141,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {result.notes && result.notes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {result.notes.map((note, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
                          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                          <span style={{ color: "#94A3B8" }}>{note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MassDwell models */}
                {result.massDwellModels && result.massDwellModels.length > 0 && (
                  <div
                    className="rounded-2xl p-6 sm:p-8 mb-6"
                    style={{ background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h3 className="text-base font-semibold text-white mb-1">
                      🏠 MassDwell Models That Fit Your Property
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                      All models are factory-built, permitted as modular, and eligible under the 2024 MA ADU law.
                    </p>
                    <div className="space-y-2 mb-5">
                      {result.massDwellModels.map((model) => (
                        <button
                          key={model.name}
                          type="button"
                          onClick={() => setSelectedModel(model)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all text-left"
                          style={
                            selectedModel?.name === model.name
                              ? { background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.35)" }
                              : { background: "#060B17", border: "1px solid rgba(255,255,255,0.06)" }
                          }
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className="font-semibold"
                              style={{ color: selectedModel?.name === model.name ? "#14B8A6" : "#94A3B8" }}
                            >
                              {model.name}
                            </span>
                            <span style={{ color: "#475569" }}>{model.size} sqft</span>
                            <span style={{ color: "#475569" }}>{model.bedBath} bd/ba</span>
                          </div>
                          <span className="font-bold" style={{ color: selectedModel?.name === model.name ? "#14B8A6" : "#E2E8F0" }}>
                            ${(model.price / 1000).toFixed(0)}K
                          </span>
                        </button>
                      ))}
                    </div>

                    <a
                      href="https://massdwell.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "#14B8A6", color: "#080D1A" }}
                    >
                      Get a Free MassDwell Quote →
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {/* ROI calculator */}
                {selectedModel && (
                  <ADURoiCalculator
                    initialCost={selectedModel.price}
                    aduSqft={selectedModel.size}
                  />
                )}

                {/* ADU permit guide CTA */}
                <div className="mt-6">
                  <Link
                    href="/permits/boston/adu-permit"
                    className="flex items-center justify-between px-5 py-4 rounded-xl transition-all group"
                    style={{ background: "#0E1525", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div>
                      <p className="font-semibold text-white text-sm group-hover:text-[#14B8A6] transition-colors">
                        Boston ADU Permit Guide →
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                        Documents, process, fees, and common rejection reasons
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#475569" }} />
                  </Link>
                </div>
              </div>
            )}

            {result.eligible === false && (
              <div
                className="rounded-2xl p-6 sm:p-8"
                style={{ background: "#0E1525", border: "1px solid rgba(251,191,36,0.3)" }}
              >
                <div className="flex items-start gap-3 mb-5">
                  <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Your property may need additional review
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                      {result.reason}
                    </p>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-sm font-semibold text-white mb-3">Options</p>
                  <div className="space-y-2">
                    {[
                      "Request a variance from the ZBA (typically 60–90 days)",
                      "Check if your municipality has adopted local ADU bylaws that may be more permissive",
                      "Consult a local zoning attorney or permit expediter",
                    ].map((opt) => (
                      <div key={opt} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                        <span className="text-sm" style={{ color: "#94A3B8" }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a
                  href="https://massdwell.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "#14B8A6", color: "#080D1A" }}
                >
                  Still interested in an ADU? Talk to MassDwell →
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {result.eligible === "maybe" && (
              <div
                className="rounded-2xl p-6 sm:p-8"
                style={{ background: "#0E1525", border: "1px solid rgba(251,191,36,0.3)" }}
              >
                <div className="flex items-start gap-3 mb-5">
                  <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Your property may need additional review
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                      {result.reason}
                    </p>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-sm font-semibold text-white mb-3">Options</p>
                  <div className="space-y-2">
                    {[
                      "Request a variance from the ZBA (typically 60–90 days)",
                      "Check if your municipality has adopted local ADU bylaws",
                    ].map((opt) => (
                      <div key={opt} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
                        <span className="text-sm" style={{ color: "#94A3B8" }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a
                  href="https://massdwell.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "#14B8A6", color: "#080D1A" }}
                >
                  Still interested in an ADU? Talk to MassDwell →
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-center" style={{ color: "#334155" }}>
          This tool provides general eligibility guidance based on MA General Laws Chapter 40A, Section 3J (2024).
          Results are not legal advice. Always verify with your local building department before proceeding.
        </p>
      </div>
    </div>
  );
}
