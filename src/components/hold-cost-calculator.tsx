"use client";

import { useState, useMemo } from "react";

interface HoldCostCalculatorProps {
  complianceScore?: number; // 0-100
  projectId?: string;
}

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}

function estimateDelayWeeks(complianceScore: number): number {
  // 100% compliance = 0 weeks delay, 0% = 8 weeks
  return Math.round(((100 - complianceScore) / 100) * 8);
}

export function HoldCostCalculator({ complianceScore = 50 }: HoldCostCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("7.0");
  const [delayWeeks, setDelayWeeks] = useState<string>(
    String(estimateDelayWeeks(complianceScore))
  );

  const autoDelay = estimateDelayWeeks(complianceScore);

  const calc = useMemo(() => {
    const loan = parseFloat(loanAmount.replace(/[^0-9.]/g, "")) || 0;
    const rate = parseFloat(interestRate) || 0;
    const weeks = parseInt(delayWeeks) || 0;

    const weeklyCarry = (loan * (rate / 100)) / 52;
    const totalHold = weeklyCarry * weeks;

    // Savings if 2 more compliance items completed → roughly reduces delay by 2 weeks
    const reducedWeeks = Math.max(0, weeks - 2);
    const reducedHold = weeklyCarry * reducedWeeks;
    const savings = totalHold - reducedHold;

    return { weeklyCarry, totalHold, savings, reducedWeeks, loan };
  }, [loanAmount, interestRate, delayWeeks]);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "#0E1525",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">Hold Cost Calculator</h3>
        <p className="text-sm text-[#64748B] mt-0.5">
          See what permit delays are actually costing you in carry costs.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-[#64748B] block mb-1.5">
            Loan Amount
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="$2,400,000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-[#334155]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748B] block mb-1.5">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="30"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-foreground"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748B] block mb-1.5">
            Projected Delay (weeks)
            {autoDelay > 0 && (
              <span className="ml-2 text-[#14B8A6]">
                auto-estimated: {autoDelay}w
              </span>
            )}
          </label>
          <input
            type="number"
            min="0"
            max="52"
            value={delayWeeks}
            onChange={(e) => setDelayWeeks(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-foreground"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748B] block mb-1.5">
            Current Compliance
          </label>
          <div
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: complianceScore >= 70 ? "#10B981" : complianceScore >= 40 ? "#F59E0B" : "#EF4444",
            }}
          >
            {complianceScore}%
          </div>
        </div>
      </div>

      {/* Output */}
      {calc.loan > 0 ? (
        <div
          className="rounded-lg p-5 space-y-4"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#64748B] mb-1">Weekly Carry Cost</p>
              <p className="text-xl font-bold text-foreground">
                {formatDollars(calc.weeklyCarry)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">Projected Delay</p>
              <p className="text-xl font-bold text-foreground">
                {delayWeeks || 0} wks
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">Total Hold Cost Risk</p>
              <p className="text-2xl font-bold text-red-400">
                {formatDollars(calc.totalHold)}
              </p>
            </div>
          </div>

          {calc.savings > 0 && parseInt(delayWeeks) > 1 && (
            <div
              className="rounded-lg p-4"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <p className="text-sm font-medium text-green-400 mb-1">
                Complete 2 more compliance items this week:
              </p>
              <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
                <span>
                  Delay drops to{" "}
                  <span className="text-green-400 font-semibold">{calc.reducedWeeks} weeks</span>
                </span>
                <span>
                  You save{" "}
                  <span className="text-green-400 font-semibold text-base">
                    {formatDollars(calc.savings)}
                  </span>
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-[#475569]">
            Every week matters. Complete your compliance items to reduce delay.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg p-5 text-center text-sm text-[#475569]"
          style={{ background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(255,255,255,0.06)" }}
        >
          Enter your loan amount to calculate hold cost risk.
        </div>
      )}
    </div>
  );
}
