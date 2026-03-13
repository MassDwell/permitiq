"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "meritlayer-welcome-dismissed";

interface WelcomeBannerProps {
  projectCount: number;
  onCreateProject: () => void;
}

export function WelcomeBanner({ projectCount, onCreateProject }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(true); // true to avoid hydration flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(isDismissed);
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  if (!mounted || dismissed || projectCount > 0) return null;

  const steps = [
    {
      num: 1,
      label: "Create your first project",
      done: projectCount > 0,
      active: true,
    },
    {
      num: 2,
      label: "Upload a permit document",
      done: false,
      active: projectCount > 0,
    },
    {
      num: 3,
      label: "Run AI compliance analysis",
      done: false,
      active: false,
    },
  ];

  return (
    <div
      className="relative mb-8 rounded-xl p-6"
      style={{
        background: "linear-gradient(135deg, #1E293B 0%, #0D1B35 100%)",
        border: "1px solid rgba(20,184,166,0.3)",
        boxShadow: "0 0 40px rgba(20,184,166,0.08)",
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 rounded-lg text-[#475569] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#F1F5F9]">Welcome to MeritLayer</h2>
        <p className="text-sm text-[#64748B] mt-1">
          You&apos;re 3 steps away from full compliance visibility
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`flex items-center gap-3 flex-1 rounded-lg px-4 py-3 transition-all ${
              step.active
                ? "border border-[rgba(20,184,166,0.2)]"
                : "border border-[rgba(255,255,255,0.1)] opacity-50"
            }`}
            style={
              step.active
                ? { background: "rgba(20,184,166,0.06)" }
                : { background: "rgba(255,255,255,0.02)" }
            }
          >
            {step.done ? (
              <CheckCircle className="h-5 w-5 text-[#14B8A6] shrink-0" />
            ) : (
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  step.active ? "border-[#14B8A6]" : "border-[#334155]"
                }`}
              >
                <span
                  className={`text-xs font-bold leading-none ${
                    step.active ? "text-[#14B8A6]" : "text-[#334155]"
                  }`}
                >
                  {step.num}
                </span>
              </div>
            )}
            <span
              className={`text-sm ${
                step.active ? "text-[#E2E8F0]" : "text-[#475569]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onCreateProject}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
        >
          Create First Project
        </Button>
        <Button
          variant="outline"
          className="border-white/10 text-[#94A3B8] hover:bg-white/5 hover:text-[#F1F5F9] text-sm"
          asChild
        >
          <a href="/permits" target="_blank" rel="noopener noreferrer">
            Explore Permit Guides
          </a>
        </Button>
      </div>
    </div>
  );
}
