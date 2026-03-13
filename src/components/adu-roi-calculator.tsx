"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

const BOSTON_ADU_RENTS = {
  studio_under_400: { low: 1400, mid: 1800, high: 2200 },
  one_bed_400_600: { low: 1800, mid: 2200, high: 2800 },
  two_bed_600_900: { low: 2200, mid: 2800, high: 3400 },
};

function getRentRange(sqft: number) {
  if (sqft < 400) return BOSTON_ADU_RENTS.studio_under_400;
  if (sqft < 600) return BOSTON_ADU_RENTS.one_bed_400_600;
  return BOSTON_ADU_RENTS.two_bed_600_900;
}

function getRentLabel(sqft: number) {
  if (sqft < 400) return "Studio / under 400 sqft";
  if (sqft < 600) return "1-bed / 400–600 sqft";
  return "2-bed / 600–900 sqft";
}

interface Props {
  initialCost?: number;
  aduSqft?: number;
}

export default function ADURoiCalculator({ initialCost = 172000, aduSqft = 565 }: Props) {
  const [cost, setCost] = useState(initialCost);
  const [monthlyRent, setMonthlyRent] = useState(
    getRentRange(aduSqft).mid
  );
  const [financing, setFinancing] = useState<"cash" | "loan" | "heloc">("cash");
  const [rate, setRate] = useState(7.0);

  const rentRange = getRentRange(aduSqft);

  // Financing cost
  let monthlyFinancing = 0;
  if (financing !== "cash") {
    const r = rate / 100 / 12;
    const n = financing === "loan" ? 240 : 180; // 20yr construction loan / 15yr HELOC
    monthlyFinancing = cost * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const netMonthly = monthlyRent - monthlyFinancing;
  const annualNet = netMonthly * 12;
  const cashOnCash = cost > 0 ? (annualNet / cost) * 100 : 0;
  const payback = annualNet > 0 ? cost / annualNet : 0;
  const tenYearTotal = annualNet * 10;

  return (
    <div
      className="rounded-2xl p-6 mt-6"
      style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.2)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-5 w-5" style={{ color: "#14B8A6" }} />
        <h3 className="text-base font-semibold text-white">ADU Investment Return Calculator</h3>
      </div>

      {/* Market rent hint */}
      <div
        className="rounded-xl px-4 py-3 mb-5 text-sm"
        style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}
      >
        <p style={{ color: "#94A3B8" }}>
          <span style={{ color: "#14B8A6" }} className="font-medium">Boston market rents</span>{" "}
          for {getRentLabel(aduSqft)}:{" "}
          <span className="text-white font-medium">
            ${rentRange.low.toLocaleString()}–${rentRange.high.toLocaleString()}/mo
          </span>
        </p>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
            ADU Construction Cost ($)
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-1"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.1)",
              // @ts-expect-error css var
              "--tw-ring-color": "#14B8A6",
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
            Expected Monthly Rent ($)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-1"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.1)",
              // @ts-expect-error css var
              "--tw-ring-color": "#14B8A6",
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
            Financing Method
          </label>
          <select
            value={financing}
            onChange={(e) => setFinancing(e.target.value as "cash" | "loan" | "heloc")}
            className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
            style={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <option value="cash">Cash</option>
            <option value="loan">Construction Loan (20yr)</option>
            <option value="heloc">Home Equity (HELOC, 15yr)</option>
          </select>
        </div>
        {financing !== "cash" && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4" style={{ color: "#14B8A6" }} />
          <p className="text-sm font-semibold text-white">Your ADU Investment Return</p>
        </div>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span style={{ color: "#94A3B8" }}>Monthly Rental Income</span>
            <span className="text-white">+${monthlyRent.toLocaleString()}</span>
          </div>
          {financing !== "cash" && (
            <div className="flex justify-between">
              <span style={{ color: "#94A3B8" }}>Monthly Financing Cost</span>
              <span style={{ color: "#F87171" }}>-${Math.round(monthlyFinancing).toLocaleString()}</span>
            </div>
          )}
          <div
            className="flex justify-between pt-2 mt-1 font-semibold"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span style={{ color: "#94A3B8" }}>Net Monthly Cash Flow</span>
            <span style={{ color: netMonthly >= 0 ? "#14B8A6" : "#F87171" }}>
              {netMonthly >= 0 ? "+" : ""}${Math.round(netMonthly).toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className="mt-4 pt-4 grid grid-cols-2 gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: "#475569" }}>Annual Net Income</p>
            <p className="text-lg font-bold" style={{ color: annualNet >= 0 ? "#14B8A6" : "#F87171" }}>
              ${Math.round(annualNet).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#475569" }}>Total Investment</p>
            <p className="text-lg font-bold text-white">${cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#475569" }}>Cash-on-Cash Return</p>
            <p className="text-lg font-bold" style={{ color: cashOnCash >= 0 ? "#14B8A6" : "#F87171" }}>
              {cashOnCash.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#475569" }}>Payback Period</p>
            <p className="text-lg font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4" style={{ color: "#475569" }} />
              {payback > 0 ? `${payback.toFixed(1)} yrs` : "—"}
            </p>
          </div>
        </div>

        <div
          className="mt-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs" style={{ color: "#475569" }}>
            10-Year Total Return:{" "}
            <span className="font-semibold" style={{ color: "#94A3B8" }}>
              ${Math.round(tenYearTotal).toLocaleString()}
            </span>{" "}
            + property appreciation
          </p>
        </div>
      </div>
    </div>
  );
}
