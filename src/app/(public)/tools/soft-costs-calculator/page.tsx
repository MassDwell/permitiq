import type { Metadata } from "next";
import { SoftCostsCalculator } from "./calculator";

export const metadata: Metadata = {
  title: "Developer Soft Costs Calculator | Boston & MA Permits | MeritLayer",
  description:
    "Estimate permit fees, trade permits, ZBA costs, and carrying costs for your Boston or Massachusetts development project. Free soft costs calculator with city-specific fee schedules.",
};

export default function SoftCostsCalculatorPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#0F172A', minHeight: '100vh' }}>
      <div className="mb-10">
        <p className="text-sm font-medium mb-2" style={{ color: '#14B8A6' }}>Free Developer Tool</p>
        <h1 className="text-4xl font-bold text-white mb-4">
          Soft Costs Calculator
        </h1>
        <p className="text-lg max-w-3xl" style={{ color: '#94A3B8' }}>
          Estimate your permit fees, trade permits, ZBA costs, and carrying costs for Boston and
          Greater Boston development projects. City-specific fee schedules built in.
        </p>
      </div>
      <SoftCostsCalculator />
    </main>
  );
}
