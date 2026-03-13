"use client";

import { useState, useMemo } from "react";

const BUILDING_FEES = {
  residential_new: { rate: 8.0, min: 150, label: "New Residential" },
  residential_addition: { rate: 6.0, min: 100, label: "Residential Addition" },
  commercial_new: { rate: 12.0, min: 200, label: "New Commercial" },
  commercial_addition: { rate: 9.0, min: 150, label: "Commercial Addition" },
  multifamily_new: { ratePerUnit: 500, min: 500, label: "New Multi-family" },
} as const;

type BuildingType = keyof typeof BUILDING_FEES;

const TRADE_FEES = {
  electrical: { base: 75, perUnit: 15, label: "Electrical" },
  plumbing: { base: 75, perUnit: 20, label: "Plumbing" },
  gas: { base: 75, perUnit: 15, label: "Gas" },
  hvac: { base: 100, perUnit: 25, label: "HVAC/Mechanical" },
} as const;

type TradeType = keyof typeof TRADE_FEES;

const SPECIAL_FEES = {
  zba_variance: { fee: 250, label: "ZBA Variance" },
  zba_special_permit: { fee: 500, label: "ZBA Special Permit" },
  article80_small: { fee: 1500, label: "Article 80 (Small)" },
  article80_large: { fee: 5000, label: "Article 80 (Large)" },
  landmark_review: { fee: 300, label: "Landmark Review" },
  bpda_review: { fee: 2500, label: "BPDA Review" },
  demo_permit: { fee: 250, label: "Demo Permit" },
} as const;

type SpecialType = keyof typeof SPECIAL_FEES;

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PermitFeeEstimator() {
  const [projectType, setProjectType] = useState<BuildingType>("residential_new");
  const [sqft, setSqft] = useState("");
  const [units, setUnits] = useState("");
  const [trades, setTrades] = useState<Set<TradeType>>(new Set());
  const [specials, setSpecials] = useState<Set<SpecialType>>(new Set());

  const isMultifamily = projectType === "multifamily_new";

  function toggleTrade(t: TradeType) {
    setTrades((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleSpecial(s: SpecialType) {
    setSpecials((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  const breakdown = useMemo(() => {
    const items: { label: string; amount: number }[] = [];
    const sf = parseFloat(sqft) || 0;
    const u = parseInt(units) || 0;

    // Building fee
    const bfee = BUILDING_FEES[projectType];
    let buildingFee = 0;
    if (isMultifamily) {
      if ("ratePerUnit" in bfee) {
        buildingFee = Math.max(bfee.min, bfee.ratePerUnit * u);
      }
    } else {
      if ("rate" in bfee) {
        buildingFee = Math.max(bfee.min, bfee.rate * sf);
      }
    }
    if (buildingFee > 0) {
      items.push({ label: "Building Permit", amount: buildingFee });
    }

    // Trade fees
    for (const trade of trades) {
      const t = TRADE_FEES[trade];
      const tradeFee = t.base + t.perUnit * (isMultifamily ? u : Math.ceil(sf / 100));
      items.push({ label: t.label, amount: tradeFee });
    }

    // Special fees
    for (const special of specials) {
      items.push({ label: SPECIAL_FEES[special].label, amount: SPECIAL_FEES[special].fee });
    }

    const total = items.reduce((sum, i) => sum + i.amount, 0);
    return { items, total };
  }, [projectType, sqft, units, trades, specials, isMultifamily]);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "#1E293B",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">Permit Fee Estimator</h3>
        <p className="text-sm text-[#CBD5E1] mt-0.5">
          Pre-calculate Boston ISD permit fees before filing. Based on 2024 fee schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Left: form inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#CBD5E1] block mb-1.5">Project Type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as BuildingType)}
              className="w-full rounded-lg px-3 py-2 text-sm text-foreground"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none",
              }}
            >
              {Object.entries(BUILDING_FEES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {isMultifamily ? (
            <div>
              <label className="text-xs font-medium text-[#CBD5E1] block mb-1.5">
                Number of Units
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 12"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#334155]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-[#CBD5E1] block mb-1.5">
                Square Footage
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 2400"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#334155]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              />
            </div>
          )}

          {/* Trade work */}
          <div>
            <label className="text-xs font-medium text-[#CBD5E1] block mb-2">Trade Work</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TRADE_FEES) as TradeType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={trades.has(t)}
                    onChange={() => toggleTrade(t)}
                    className="rounded"
                    style={{ accentColor: "#14B8A6" }}
                  />
                  <span className="text-sm text-[#E2E8F0] group-hover:text-foreground transition-colors">
                    {TRADE_FEES[t].label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Special reviews */}
          <div>
            <label className="text-xs font-medium text-[#CBD5E1] block mb-2">
              Special Reviews
            </label>
            <div className="space-y-1.5">
              {(Object.keys(SPECIAL_FEES) as SpecialType[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={specials.has(s)}
                    onChange={() => toggleSpecial(s)}
                    style={{ accentColor: "#14B8A6" }}
                  />
                  <span className="text-sm text-[#E2E8F0] group-hover:text-foreground transition-colors">
                    {SPECIAL_FEES[s].label}
                  </span>
                  <span className="text-xs text-[#475569] ml-auto">
                    {formatDollars(SPECIAL_FEES[s].fee)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: fee breakdown */}
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs font-medium text-[#CBD5E1] mb-3 uppercase tracking-wider">
            Fee Breakdown
          </p>
          {breakdown.items.length === 0 ? (
            <p className="text-sm text-[#475569] py-4 text-center">
              Enter project details to see fee estimate.
            </p>
          ) : (
            <div className="space-y-2">
              {breakdown.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-[#E2E8F0]">{item.label}</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {formatDollars(item.amount)}
                  </span>
                </div>
              ))}
              <div
                className="pt-2 mt-2 flex justify-between items-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="text-sm font-medium text-foreground">Total Estimated</span>
                <span className="text-lg font-bold text-[#14B8A6] tabular-nums">
                  {formatDollars(breakdown.total)}
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-[#334155] mt-4">
            Estimates based on Boston ISD 2024 schedule. Actual fees determined at permit counter.
          </p>
        </div>
      </div>
    </div>
  );
}
