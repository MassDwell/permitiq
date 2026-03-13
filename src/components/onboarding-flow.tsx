"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  ArrowRight,
  MapPin,
  Loader2,
  Building2,
  Home,
  Hammer,
  Trash2,
  X,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "residential", label: "New Construction", icon: Building2 },
  { value: "renovation", label: "Renovation", icon: Hammer },
  { value: "adu", label: "ADU", icon: Home },
  { value: "commercial", label: "Demolition", icon: Trash2 },
] as const;

// Simple jurisdiction detection from address string
function detectJurisdictionFromAddress(address: string): {
  jurisdiction: string;
  display: string;
  agency: string;
} {
  const lower = address.toLowerCase();
  if (/cambridge/.test(lower)) {
    return { jurisdiction: "cambridge", display: "Cambridge, MA", agency: "ISD" };
  }
  if (/brookline/.test(lower)) {
    return { jurisdiction: "brookline", display: "Brookline, MA", agency: "Building Dept" };
  }
  if (/somerville/.test(lower)) {
    return { jurisdiction: "somerville", display: "Somerville, MA", agency: "ISD" };
  }
  if (/salem/.test(lower)) {
    return { jurisdiction: "salem", display: "Salem, MA", agency: "ISD" };
  }
  if (/lowell/.test(lower)) {
    return { jurisdiction: "lowell", display: "Lowell, MA", agency: "Building Dept" };
  }
  if (/springfield/.test(lower)) {
    return { jurisdiction: "springfield", display: "Springfield, MA", agency: "Building Dept" };
  }
  // Default to Boston
  return { jurisdiction: "boston", display: "Boston, MA", agency: "ISD" };
}

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  // Step 1 fields
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState<string>("residential");

  // Step 2 state
  const [detectedJurisdiction, setDetectedJurisdiction] = useState<{
    jurisdiction: string;
    display: string;
    agency: string;
  } | null>(null);

  // Step 3 state
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [requirementsCount, setRequirementsCount] = useState<number | null>(null);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);

  const utils = trpc.useUtils();

  const completeOnboarding = trpc.settings.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.settings.getProfile.invalidate();
    },
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      setCreatedProjectId(project.id);
      setIsLoadingRequirements(true);
      utils.projects.list.invalidate();
      setStep(3);

      // Poll for requirements (auto-triggered by backend)
      const pollForRequirements = async () => {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const projectData = await utils.projects.get.fetch({ id: project.id });
            const itemCount = projectData?.complianceItems?.length ?? 0;
            if (itemCount > 0 || attempts >= maxAttempts) {
              clearInterval(interval);
              setRequirementsCount(itemCount);
              setIsLoadingRequirements(false);
              completeOnboarding.mutate();
            }
          } catch {
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setRequirementsCount(0);
              setIsLoadingRequirements(false);
              completeOnboarding.mutate();
            }
          }
        }, 500);
      };
      pollForRequirements();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Step 1 → Step 2: detect jurisdiction
  const handleContinueToStep2 = () => {
    if (!address.trim()) {
      toast.error("Please enter a project address");
      return;
    }
    const detected = detectJurisdictionFromAddress(address);
    setDetectedJurisdiction(detected);
    setStep(2);
  };

  // Step 2: Create project
  const handleCreateProject = () => {
    if (!address.trim() || !detectedJurisdiction) return;

    // Map "commercial" (used for demolition) to the correct projectType
    const mappedType = projectType === "commercial" ? "commercial" : projectType;

    createProject.mutate({
      name: address.trim().split(",")[0] || "New Project",
      address: address.trim(),
      jurisdiction: detectedJurisdiction.display,
      projectType: mappedType as "residential" | "commercial" | "adu" | "mixed_use" | "renovation",
    });
  };

  // Skip handler
  const handleSkip = () => {
    completeOnboarding.mutate();
    localStorage.setItem("meritlayer-onboarding-complete", "true");
    setIsVisible(false);
    onSkip?.();
  };

  // Navigate to project
  const handleOpenProject = () => {
    setIsVisible(false);
    onComplete?.();
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(14, 21, 37, 0.95)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "#0E1525",
          border: "1px solid rgba(20, 184, 166, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-2 w-2 rounded-full transition-all duration-300"
              style={{
                background: step >= s ? "#14B8A6" : "rgba(255, 255, 255, 0.1)",
                boxShadow: step === s ? "0 0 8px rgba(20, 184, 166, 0.5)" : "none",
              }}
            />
          ))}
        </div>

        <div className="p-8">
          {/* Step 1: What is your first project? */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2 text-center">
                What is your first project?
              </h2>
              <p className="text-[#94A3B8] text-sm text-center mb-8">
                We'll auto-detect your jurisdiction and load permit requirements.
              </p>

              {/* Address input */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="ob-address" className="text-[#E2E8F0] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#14B8A6]" />
                  Project Address
                </Label>
                <Input
                  id="ob-address"
                  placeholder="123 Main Street, Boston, MA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    background: "#141C2E",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#F1F5F9",
                  }}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              {/* Project type button group */}
              <div className="space-y-2 mb-8">
                <Label className="text-[#E2E8F0]">Project Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = projectType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setProjectType(type.value)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                        style={{
                          background: isSelected
                            ? "rgba(20, 184, 166, 0.15)"
                            : "rgba(255, 255, 255, 0.03)",
                          border: isSelected
                            ? "1px solid rgba(20, 184, 166, 0.5)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isSelected ? "#14B8A6" : "#94A3B8",
                        }}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: isSelected
                              ? "rgba(20, 184, 166, 0.2)"
                              : "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleContinueToStep2}
                className="w-full h-12 bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold text-base"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <button
                onClick={handleSkip}
                className="w-full mt-4 text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 2: Jurisdiction detected */}
          {step === 2 && detectedJurisdiction && (
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6 text-center">
                Jurisdiction Detected
              </h2>

              {/* Jurisdiction card */}
              <div
                className="rounded-xl p-6 mb-8"
                style={{
                  background: "rgba(20, 184, 166, 0.08)",
                  border: "1px solid rgba(20, 184, 166, 0.3)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(20, 184, 166, 0.2)" }}
                  >
                    <CheckCircle className="h-6 w-6 text-[#14B8A6]" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#F1F5F9]">
                      Found: {detectedJurisdiction.display} ({detectedJurisdiction.agency})
                    </p>
                    <p className="text-sm text-[#14B8A6]">Permit rules loaded</p>
                  </div>
                </div>
              </div>

              {/* Project summary */}
              <div
                className="rounded-xl p-4 mb-8 space-y-3"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Address</span>
                  <span className="text-[#F1F5F9] font-medium truncate ml-4 max-w-[200px]">
                    {address}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Type</span>
                  <span className="text-[#F1F5F9] font-medium">
                    {PROJECT_TYPES.find((t) => t.value === projectType)?.label}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 border-white/10 text-[#E2E8F0] bg-transparent hover:bg-white/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProject.isPending}
                  className="flex-1 h-12 bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
                >
                  {createProject.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create my project"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Finding requirements / Done */}
          {step === 3 && (
            <div className="text-center">
              {isLoadingRequirements ? (
                <>
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(20, 184, 166, 0.15)" }}
                  >
                    <Loader2 className="h-8 w-8 text-[#14B8A6] animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
                    Finding your requirements...
                  </h2>
                  <p className="text-[#94A3B8] text-sm">
                    Analyzing permit rules for your jurisdiction
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: "rgba(20, 184, 166, 0.15)",
                      border: "1px solid rgba(20, 184, 166, 0.3)",
                    }}
                  >
                    <CheckCircle className="h-8 w-8 text-[#14B8A6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                    {requirementsCount !== null && requirementsCount > 0
                      ? `${requirementsCount} permit steps identified`
                      : "Project created!"}
                  </h2>
                  <p className="text-[#94A3B8] text-sm mb-8">
                    {requirementsCount !== null && requirementsCount > 0
                      ? "Your permit checklist is ready. Let's get started."
                      : "We're loading permit requirements for your jurisdiction."}
                  </p>

                  <Button
                    onClick={handleOpenProject}
                    className="w-full h-12 bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold text-base"
                  >
                    Open my project
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <button
                    onClick={handleSkip}
                    className="w-full mt-4 text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    Skip
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
