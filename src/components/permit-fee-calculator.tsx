"use client";

import { useState } from "react";
import { calculatePermitFee, calculateBostonISDFee, BOSTON_ISD_PERMIT_TYPES } from "@/lib/permit-rules";
import type { BostonISDFeeInput } from "@/lib/permit-rules";

type Props = {
  jurisdiction: string;
  permitTypeSlug?: string;
  showSignupCTA?: boolean;
};

const BOSTON_ISD_JURISDICTIONS = ["BOSTON_ISD", "BOSTON_BPDA", "BOSTON_ZBA"];

export function PermitFeeCalculator({ jurisdiction, permitTypeSlug, showSignupCTA = true }: Props) {
  // Standard mode state
  const [projectCost, setProjectCost] = useState("");
  const [projectType, setProjectType] = useState<"residential" | "commercial">("residential");

  // Boston ISD comprehensive mode state
  const [bostonPermitType, setBostonPermitType] = useState<BostonISDFeeInput["permitType"]>("new_construction_residential");
  const [bostonCost, setBostonCost] = useState("");
  const [bostonSqFt, setBostonSqFt] = useState("");
  const [bostonCircuits, setBostonCircuits] = useState("");
  const [bostonFixtures, setBostonFixtures] = useState("");
  const [bostonAppliances, setBostonAppliances] = useState("");
  const [bostonTons, setBostonTons] = useState("");
  const [bostonVariances, setBostonVariances] = useState("1");

  const isBostonISD = BOSTON_ISD_JURISDICTIONS.includes(jurisdiction);

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  // Boston ISD comprehensive calculation
  const bostonResult = isBostonISD
    ? calculateBostonISDFee({
        permitType: bostonPermitType,
        projectCost: parseFloat(bostonCost.replace(/,/g, "")) || 0,
        sqFt: parseFloat(bostonSqFt.replace(/,/g, "")) || 0,
        circuits: parseInt(bostonCircuits) || 0,
        fixtures: parseInt(bostonFixtures) || 0,
        appliances: parseInt(bostonAppliances) || 0,
        tonsOfCooling: parseFloat(bostonTons) || 0,
        variancesRequested: parseInt(bostonVariances) || 1,
      })
    : null;

  // Standard calculation
  const cost = parseFloat(projectCost.replace(/,/g, "")) || 0;
  const standardResult = !isBostonISD && cost > 0 && permitTypeSlug
    ? calculatePermitFee(jurisdiction, permitTypeSlug, cost, projectType)
    : null;

  const needsCostInput = ["new_construction_residential", "new_construction_commercial", "alteration"].includes(bostonPermitType);
  const needsSqFt = ["demolition", "article_80_large"].includes(bostonPermitType);
  const needsCircuits = bostonPermitType === "electrical";
  const needsFixtures = bostonPermitType === "plumbing";
  const needsAppliances = bostonPermitType === "gas";
  const needsTons = bostonPermitType === "hvac";
  const needsVariances = bostonPermitType === "zba_filing";
  const isFlat = ["article_80_small"].includes(bostonPermitType);

  const hasBostonResult = bostonResult && bostonResult.items.length > 0;
  const hasStandardResult = standardResult && standardResult.items.length > 0;

  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Permit Fee Estimator</h2>
      <p className="text-sm text-gray-500 mb-5">
        {isBostonISD
          ? "Boston ISD 2024 fee schedule — select permit type to estimate fees."
          : "Enter your project cost to estimate permit fees."}
      </p>

      {isBostonISD ? (
        /* Boston ISD comprehensive mode */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
            <select
              value={bostonPermitType}
              onChange={(e) => setBostonPermitType(e.target.value as BostonISDFeeInput["permitType"])}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {BOSTON_ISD_PERMIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {!isFlat && (
            <div className="flex flex-col sm:flex-row gap-3">
              {needsCostInput && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction Cost ($)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bostonCost}
                    onChange={(e) => setBostonCost(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="e.g. 500000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsSqFt && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet (SF)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bostonSqFt}
                    onChange={(e) => setBostonSqFt(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="e.g. 3500"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsCircuits && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Circuits</label>
                  <input
                    type="number"
                    min="0"
                    value={bostonCircuits}
                    onChange={(e) => setBostonCircuits(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsFixtures && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Fixtures</label>
                  <input
                    type="number"
                    min="0"
                    value={bostonFixtures}
                    onChange={(e) => setBostonFixtures(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsAppliances && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Appliances</label>
                  <input
                    type="number"
                    min="0"
                    value={bostonAppliances}
                    onChange={(e) => setBostonAppliances(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsTons && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tons of Cooling</label>
                  <input
                    type="number"
                    min="0"
                    value={bostonTons}
                    onChange={(e) => setBostonTons(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
              {needsVariances && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variances Requested</label>
                  <input
                    type="number"
                    min="1"
                    value={bostonVariances}
                    onChange={(e) => setBostonVariances(e.target.value)}
                    placeholder="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {hasBostonResult && (
            <div className="space-y-3 mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-blue-200">
                    <th className="pb-2 font-medium">Fee</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right hidden md:table-cell pl-4">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {bostonResult.items.map((item, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-2">
                        <p className="text-gray-700">{item.label}</p>
                        {item.note && (
                          <p className="text-xs text-gray-400">{item.note}</p>
                        )}
                      </td>
                      <td className="py-2 text-right font-semibold text-gray-900 whitespace-nowrap pl-4">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 text-right text-gray-500 text-xs hidden md:table-cell pl-4 whitespace-nowrap">
                        {item.timeline ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-semibold text-gray-900">Estimated Total</td>
                    <td className="pt-3 text-right font-bold text-blue-700 text-base">
                      {formatCurrency(bostonResult.total)}
                    </td>
                    <td className="hidden md:table-cell" />
                  </tr>
                </tfoot>
              </table>
              <p className="text-xs text-gray-400">{bostonResult.disclaimer}</p>
            </div>
          )}
        </div>
      ) : (
        /* Standard mode */
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Cost ($)</label>
              <input
                type="text"
                inputMode="numeric"
                value={projectCost}
                onChange={(e) => setProjectCost(e.target.value.replace(/[^0-9.]/g, ""))}
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

          {hasStandardResult ? (
            <div className="space-y-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-blue-200">
                    <th className="pb-2 font-medium">Fee</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium text-right hidden sm:table-cell pl-4">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {standardResult.items.map((item, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-2 text-gray-700">{item.label}</td>
                      <td className="py-2 text-right font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 text-right text-gray-500 text-xs hidden sm:table-cell pl-4">
                        {item.timeline ?? item.note ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-semibold text-gray-900">Estimated Total</td>
                    <td className="pt-3 text-right font-bold text-blue-700 text-base">
                      {formatCurrency(standardResult.total)}
                    </td>
                    <td className="hidden sm:table-cell" />
                  </tr>
                </tfoot>
              </table>
              <p className="text-xs text-gray-400 mt-3">{standardResult.disclaimer}</p>
            </div>
          ) : cost > 0 ? (
            <p className="text-sm text-gray-500">
              Fee schedule data not available for this permit type. Contact the building department directly.
            </p>
          ) : null}
        </div>
      )}

      {showSignupCTA && (
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
      )}
    </div>
  );
}
