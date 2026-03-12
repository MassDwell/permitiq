import type { Metadata } from "next";
import { SoftCostsCalculator } from "./calculator";

export const metadata: Metadata = {
  title: "Developer Soft Costs Calculator | Boston & MA Permits | MeritLayer",
  description:
    "Estimate permit fees, trade permits, ZBA costs, and carrying costs for your Boston or Massachusetts development project. Free soft costs calculator with city-specific fee schedules.",
};

export default function SoftCostsCalculatorPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium text-blue-600 mb-2">Free Developer Tool</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Soft Costs Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Estimate your permit fees, trade permits, ZBA costs, and carrying costs for Boston and
          Greater Boston development projects. City-specific fee schedules built in.
        </p>
      </div>
      <SoftCostsCalculator />
    </main>
  );
}
