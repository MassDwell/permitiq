"use client";

import { useState } from "react";
import { calculatePermitFee } from "@/lib/permit-rules";

type Props = {
  jurisdiction: string;
  permitTypeSlug: string;
};

export function PermitFeeCalculator({ jurisdiction, permitTypeSlug }: Props) {
  const [projectCost, setProjectCost] = useState("");
  const [projectType, setProjectType] = useState<"residential" | "commercial">("residential");

  const cost = parseFloat(projectCost.replace(/,/g, "")) || 0;
  const result = cost > 0 ? calculatePermitFee(jurisdiction, permitTypeSlug, cost, projectType) : null;

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hasCalculation = result && result.items.length > 0;

  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Permit Fee Estimator</h2>
      <p className="text-sm text-gray-500 mb-5">
        Enter your project cost to estimate permit fees.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Cost ($)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={projectCost}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, "");
              setProjectCost(raw);
            }}
            placeholder="e.g. 250000"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as "residential" | "commercial")}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-[38px]"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {hasCalculation ? (
        <div className="space-y-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-blue-200">
                <th className="pb-2 font-medium">Fee</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell pl-4">Basis</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item, i) => (
                <tr key={i} className="border-b border-blue-100">
                  <td className="py-2 text-gray-700">{item.label}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-2 text-right text-gray-500 text-xs hidden sm:table-cell pl-4">
                    {item.note}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-3 font-semibold text-gray-900">Estimated Total</td>
                <td className="pt-3 text-right font-bold text-blue-700 text-base">
                  {formatCurrency(result.total)}
                </td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
          <p className="text-xs text-gray-400 mt-3">{result.disclaimer}</p>
        </div>
      ) : cost > 0 ? (
        <p className="text-sm text-gray-500">
          Fee schedule data not available for this permit type. Contact the building department directly.
        </p>
      ) : null}

      <div className="mt-6 pt-4 border-t border-blue-200">
        <p className="text-sm text-gray-600 mb-3">
          Track permit fees, deadlines, and compliance requirements across all your projects.
        </p>
        <a
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Track compliance with MeritLayer →
        </a>
      </div>
    </div>
  );
}
