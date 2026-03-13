"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  Calculator,
  ArrowRight,
  Info,
  ChevronDown,
} from "lucide-react";
import { calculatePermitFee } from "@/lib/permit-rules";

const CITIES = [
  { value: "boston", label: "Boston" },
  { value: "cambridge", label: "Cambridge" },
  { value: "brookline", label: "Brookline" },
  { value: "somerville", label: "Somerville" },
  { value: "salem", label: "Salem" },
  { value: "lowell", label: "Lowell" },
  { value: "springfield", label: "Springfield" },
];

const PERMIT_TYPES = [
  { value: "building-permit", label: "Building Permit" },
  { value: "demolition-permit", label: "Demo / Demolition Permit" },
  { value: "zba-appeal", label: "ZBA Appeal / Variance" },
  { value: "adu", label: "ADU (Accessory Dwelling Unit)" },
];

// Estimated permit timelines (weeks) by city + permit type
function estimateTimeline(
  city: string,
  permitType: string,
  sqft: number
): { min: number; max: number; note: string } {
  if (permitType === "zba-appeal") {
    return { min: 8, max: 16, note: "ZBA hearing + 15-day decision window" };
  }
  if (permitType === "demolition-permit") {
    return { min: 4, max: 8, note: "Includes Article 85 landmark review" };
  }
  if (permitType === "adu") {
    return { min: 6, max: 12, note: "Building + all trade permits" };
  }
  // Building permit — varies by city and size
  if (sqft >= 50000) {
    return { min: 16, max: 32, note: "Large project — Article 80 review likely required" };
  }
  if (sqft >= 20000) {
    return { min: 10, max: 20, note: "May require Article 80 Small Project Review" };
  }
  switch (city) {
    case "boston":
      return { min: 6, max: 14, note: "Boston ISD review window" };
    case "cambridge":
      return { min: 5, max: 12, note: "Cambridge ISD review window" };
    case "brookline":
      return { min: 5, max: 10, note: "Brookline Building Dept review" };
    case "somerville":
      return { min: 4, max: 10, note: "Somerville ISD review window" };
    case "salem":
      return { min: 4, max: 8, note: "Salem ISD review window" };
    case "lowell":
      return { min: 4, max: 8, note: "Lowell Development Services review" };
    case "springfield":
      return { min: 4, max: 8, note: "Springfield Building Dept review" };
    default:
      return { min: 4, max: 12, note: "Typical MA review window" };
  }
}

// ZBA fee calculation
function calculateZbaFee(
  city: string,
  unitCount: number,
  numViolations: number
): number | null {
  if (city !== "boston") return null; // Only Boston ZBA data available
  if (unitCount <= 3) return 150;
  return numViolations * 150;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  id: string;
}

function Select({ value, onChange, options, label, id }: SelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#64748B' }} />
      </div>
    </div>
  );
}

interface NumberInputProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
  id: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: string;
}

function NumberInput({ value, onChange, label, id, prefix, suffix, placeholder, hint }: NumberInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm font-medium" style={{ color: '#64748B' }}>{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm placeholder:text-[#64748B] ${
            prefix ? "pl-7" : "pl-4"
          } ${suffix ? "pr-12" : "pr-4"}`}
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.10)' }}
        />
        {suffix && (
          <span className="absolute right-3 text-sm" style={{ color: '#64748B' }}>{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{hint}</p>}
    </div>
  );
}

interface ResultRowProps {
  label: string;
  amount: number | null;
  note?: string;
  highlight?: boolean;
  isTotal?: boolean;
}

function ResultRow({ label, amount, note, highlight, isTotal }: ResultRowProps) {
  if (amount === null) return null;
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 ${
        isTotal
          ? "pt-4 mt-1"
          : ""
      }`}
      style={isTotal ? { borderTop: '2px solid rgba(255,255,255,0.10)' } : { borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isTotal ? "font-bold text-base text-white" : highlight ? "font-semibold text-white" : ""}`} style={!isTotal && !highlight ? { color: '#94A3B8' } : {}}>
          {label}
        </p>
        {note && <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{note}</p>}
      </div>
      <p className={`font-bold flex-shrink-0 ${isTotal ? "text-xl" : "text-white"}`} style={isTotal ? { color: '#14B8A6' } : {}}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

export function SoftCostsCalculator() {
  const [city, setCity] = useState("boston");
  const [permitType, setPermitType] = useState("building-permit");
  const [projectType, setProjectType] = useState<"residential" | "commercial">("residential");
  const [constructionCost, setConstructionCost] = useState("");
  const [sqft, setSqft] = useState("");
  const [units, setUnits] = useState("1");
  const [carryingCost, setCarryingCost] = useState("");
  const [violations, setViolations] = useState("1");

  const results = useMemo(() => {
    const cost = parseFloat(constructionCost) || 0;
    const sqftNum = parseFloat(sqft) || 0;
    const unitsNum = parseInt(units) || 1;
    const monthlyCarry = parseFloat(carryingCost) || 0;
    const violationsNum = parseInt(violations) || 1;

    if (cost <= 0) return null;

    // Building permit fee
    const permitSlug = permitType === "adu" ? "building-permit" : permitType === "zba-appeal" ? "building-permit" : permitType;
    const permitCalc = calculatePermitFee(city, permitSlug, cost, projectType);
    const buildingPermitFee = permitCalc.total;
    const permitItems = permitCalc.items;

    // Trade permits estimate (~15% of building permit)
    const tradePermitFee = permitType === "zba-appeal" ? 0 : Math.round(buildingPermitFee * 0.15);

    // ZBA fee (if applicable)
    const zbaFee =
      permitType === "zba-appeal"
        ? calculateZbaFee(city, unitsNum, violationsNum) ?? 0
        : 0;

    // Timeline
    const timeline = estimateTimeline(city, permitType, sqftNum);
    const timelineMidpoint = (timeline.min + timeline.max) / 2;

    // Carrying cost during review (at midpoint of timeline)
    const carryingDuringReview = monthlyCarry > 0
      ? Math.round(monthlyCarry * (timelineMidpoint / 4.33)) // convert weeks to months
      : 0;

    const totalEstimate = buildingPermitFee + tradePermitFee + zbaFee + carryingDuringReview;

    return {
      buildingPermitFee,
      permitItems,
      tradePermitFee,
      zbaFee,
      timeline,
      carryingDuringReview,
      monthlyCarry,
      totalEstimate,
    };
  }, [city, permitType, projectType, constructionCost, sqft, units, carryingCost, violations]);

  const showZbaOptions = permitType === "zba-appeal";

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Inputs */}
      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-2xl p-6" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Calculator className="h-4 w-4" style={{ color: '#14B8A6' }} />
            Project Details
          </h2>

          <div className="space-y-4">
            <Select
              id="city"
              label="City"
              value={city}
              onChange={setCity}
              options={CITIES}
            />

            <Select
              id="permitType"
              label="Permit Type"
              value={permitType}
              onChange={setPermitType}
              options={PERMIT_TYPES}
            />

            <div>
              <p className="block text-sm font-medium mb-1.5" style={{ color: '#94A3B8' }}>Project Type</p>
              <div className="flex gap-2">
                {(["residential", "commercial"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setProjectType(t)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
                    style={projectType === t
                      ? { background: '#14B8A6', color: '#080D1A', border: '1px solid #14B8A6' }
                      : { background: '#111827', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.10)' }
                    }
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <NumberInput
              id="constructionCost"
              label="Estimated Construction Cost"
              value={constructionCost}
              onChange={setConstructionCost}
              prefix="$"
              placeholder="500000"
              hint="Total hard construction cost (materials + labor)"
            />

            <NumberInput
              id="sqft"
              label="Project Size"
              value={sqft}
              onChange={setSqft}
              suffix="sq ft"
              placeholder="2500"
              hint="Gross floor area being added or renovated"
            />

            <NumberInput
              id="units"
              label="Number of Units"
              value={units}
              onChange={setUnits}
              placeholder="1"
            />

            {showZbaOptions && city === "boston" && (
              <NumberInput
                id="violations"
                label="Number of ZBA Violations"
                value={violations}
                onChange={setViolations}
                placeholder="1"
                hint="Each violation = $150 fee (for >3-unit / commercial projects)"
              />
            )}

            <NumberInput
              id="carryingCost"
              label="Monthly Carrying Cost (optional)"
              value={carryingCost}
              onChange={setCarryingCost}
              prefix="$"
              placeholder="15000"
              hint="Loan interest + taxes + insurance per month during review"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {!results ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: '#0D1525', border: '2px dashed rgba(255,255,255,0.10)' }}>
            <Calculator className="h-10 w-10 mx-auto mb-3" style={{ color: '#475569' }} />
            <p className="font-medium" style={{ color: '#64748B' }}>Enter your project details to see an estimate</p>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>Start with construction cost on the left</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.20)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5" style={{ color: '#14B8A6' }} />
                <p className="font-semibold text-white">Estimated Permit Timeline</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold" style={{ color: '#14B8A6' }}>
                  {results.timeline.min}–{results.timeline.max}
                </p>
                <div>
                  <p className="font-medium text-white">weeks</p>
                  <p className="text-sm" style={{ color: '#64748B' }}>{results.timeline.note}</p>
                </div>
              </div>
              {parseFloat(sqft) >= 50000 && (
                <div className="mt-3 rounded-lg px-4 py-2.5 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                  <p className="text-sm" style={{ color: '#FCD34D' }}>
                    Projects ≥50,000 sq ft require{" "}
                    <Link href="/permits/boston/article-80-review" className="font-semibold underline">
                      Article 80 Large Project Review
                    </Link>{" "}
                    — add 12–24 months to your timeline.
                  </p>
                </div>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="rounded-2xl p-6" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5" style={{ color: '#94A3B8' }} />
                <p className="font-semibold text-white">Estimated Soft Costs</p>
              </div>

              <div className="space-y-0">
                {/* Building permit breakdown */}
                {results.permitItems.map((item) => (
                  <ResultRow
                    key={item.label}
                    label={item.label}
                    amount={item.amount}
                    note={item.note}
                    highlight
                  />
                ))}

                {/* Trade permits */}
                {results.tradePermitFee > 0 && (
                  <ResultRow
                    label="Trade Permits (electrical, plumbing, mechanical)"
                    amount={results.tradePermitFee}
                    note="Estimated ~15% of building permit — each trade filed separately by licensed contractor"
                  />
                )}

                {/* ZBA fee */}
                {results.zbaFee > 0 && (
                  <ResultRow
                    label="ZBA Filing Fee"
                    amount={results.zbaFee}
                    note={
                      parseInt(units) <= 3
                        ? "Residential ≤3 units: $150 flat"
                        : `${violations} violation(s) × $150`
                    }
                  />
                )}

                {/* Carrying cost */}
                {results.carryingDuringReview > 0 && (
                  <ResultRow
                    label="Carrying Cost During Review"
                    amount={results.carryingDuringReview}
                    note={`${formatCurrency(results.monthlyCarry)}/month × ${((results.timeline.min + results.timeline.max) / 2 / 4.33).toFixed(1)} months (timeline midpoint)`}
                  />
                )}

                {/* Total */}
                <ResultRow
                  label="Total Estimated Soft Costs"
                  amount={results.totalEstimate}
                  isTotal
                />
              </div>

              <div className="mt-5 rounded-xl p-4 flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#475569' }} />
                <p className="text-xs" style={{ color: '#64748B' }}>
                  This is an estimate only. Actual fees depend on project specifics and must be
                  confirmed with the local building department. Trade permit fees vary by scope.
                  Carrying cost calculation uses the midpoint of the estimated permit timeline.
                </p>
              </div>
            </div>

            {/* Related guides */}
            <div className="rounded-2xl p-5" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-semibold text-white mb-3 text-sm">Related Permit Guides</p>
              <div className="space-y-2">
                {permitType === "zba-appeal" && (
                  <Link
                    href="/permits/boston/zba-variance"
                    className="flex items-center justify-between p-3 rounded-xl transition-all group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-sm font-medium group-hover:text-[#14B8A6] transition-colors" style={{ color: '#94A3B8' }}>
                      Boston ZBA Variance Guide — 2026 Schedule &amp; Process
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors" style={{ color: '#64748B' }} />
                  </Link>
                )}
                {(permitType === "building-permit" && parseFloat(sqft) >= 20000) && (
                  <Link
                    href="/permits/boston/article-80-review"
                    className="flex items-center justify-between p-3 rounded-xl transition-all group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-sm font-medium group-hover:text-[#14B8A6] transition-colors" style={{ color: '#94A3B8' }}>
                      Boston Article 80 Development Review Guide
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors" style={{ color: '#64748B' }} />
                  </Link>
                )}
                {permitType === "adu" && (
                  <Link
                    href="/permits/massachusetts/adu-permit"
                    className="flex items-center justify-between p-3 rounded-xl transition-all group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-sm font-medium group-hover:text-[#14B8A6] transition-colors" style={{ color: '#94A3B8' }}>
                      Massachusetts ADU Permit Guide
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors" style={{ color: '#64748B' }} />
                  </Link>
                )}
                <Link
                  href="/permits"
                  className="flex items-center justify-between p-3 rounded-xl transition-all group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-sm font-medium group-hover:text-[#14B8A6] transition-colors" style={{ color: '#94A3B8' }}>
                    All Massachusetts Permit Guides
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:text-[#14B8A6] transition-colors" style={{ color: '#64748B' }} />
                </Link>
              </div>
            </div>

            {/* MeritLayer CTA */}
            <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.08) 100%)', border: '1px solid rgba(20,184,166,0.25)' }}>
              <p className="font-bold text-white text-lg mb-1">Track These Soft Costs in MeritLayer</p>
              <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
                Import your projects, upload permit documents, and track every deadline and fee across
                your Boston development portfolio.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                style={{ background: '#14B8A6', color: '#080D1A' }}
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
