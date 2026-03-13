"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Building2,
  Loader2,
  CheckCircle,
  ArrowRight,
  Clock,
  FileCheck
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "residential", label: "New Construction", description: "Ground-up residential build" },
  { value: "renovation", label: "Renovation", description: "Interior/exterior updates" },
  { value: "adu", label: "ADU", description: "Accessory Dwelling Unit" },
  { value: "commercial", label: "Demolition", description: "Structure teardown" },
];

interface OnboardingFlowProps {
  userName?: string | null;
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingFlow({ userName, forceOpen, onClose }: OnboardingFlowProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState<
    "residential" | "commercial" | "adu" | "mixed_use" | "renovation"
  >("residential");

  // Step 2 data
  const [detectedJurisdiction, setDetectedJurisdiction] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Step 3 data
  const [complianceItems, setComplianceItems] = useState<any[]>([]);
  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState(false);

  const utils = trpc.useUtils();

  // Fetch profile to check onboardingCompleted
  const { data: profile, isLoading: profileLoading } = trpc.settings.getProfile.useQuery();

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    if (profileLoading) return;
    if (profile && !profile.onboardingCompleted) {
      setOpen(true);
    }
  }, [forceOpen, profile, profileLoading]);

  const completeOnboarding = trpc.settings.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.settings.getProfile.invalidate();
    },
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      setCreatedProjectId(project.id);
      utils.projects.list.invalidate();
      // Auto-detect jurisdiction from address
      detectJurisdiction(project.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const researchRequirements = trpc.compliance.researchRequirements.useMutation({
    onSuccess: async () => {
      // Fetch the newly created compliance items
      if (createdProjectId) {
        const data = await utils.compliance.listForProject.fetch({ projectId: createdProjectId });
        setComplianceItems(data);
        setIsGeneratingRequirements(false);
        setStep(3);
      }
    },
    onError: (error) => {
      toast.error("Failed to generate requirements");
      setIsGeneratingRequirements(false);
    },
  });

  const detectJurisdiction = (projectId: string) => {
    // Simple jurisdiction detection from address
    const addressLower = address.toLowerCase();
    let jurisdiction = "BOSTON_ISD";
    let jurisdictionDisplay = "Boston, MA (ISD)";

    if (addressLower.includes("cambridge")) {
      jurisdiction = "CAMBRIDGE_MA";
      jurisdictionDisplay = "Cambridge, MA";
    } else if (addressLower.includes("brookline")) {
      jurisdiction = "BROOKLINE_MA";
      jurisdictionDisplay = "Brookline, MA";
    } else if (addressLower.includes("somerville")) {
      jurisdiction = "SOMERVILLE_MA";
      jurisdictionDisplay = "Somerville, MA";
    } else if (addressLower.includes("newton")) {
      jurisdiction = "NEWTON_MA";
      jurisdictionDisplay = "Newton, MA";
    } else if (addressLower.includes("quincy")) {
      jurisdiction = "QUINCY_MA";
      jurisdictionDisplay = "Quincy, MA";
    }

    setDetectedJurisdiction(jurisdictionDisplay);
    setStep(2);
  };

  const handleStep1Continue = () => {
    if (!address.trim()) {
      toast.error("Please enter a project address");
      return;
    }

    // Create project with auto-detected jurisdiction
    const projectName = address.split(",")[0]?.trim() || address;
    createProject.mutate({
      name: projectName,
      address: address.trim(),
      jurisdiction: detectedJurisdiction || "BOSTON_ISD",
      projectType,
    });
  };

  const handleStep2Continue = () => {
    if (!createdProjectId) return;

    setIsGeneratingRequirements(true);

    // Map project type to permit type for research
    const permitTypeMap: Record<string, string> = {
      residential: "Boston Building Permit - Residential",
      renovation: "Boston Building Permit - Renovation",
      adu: "Boston Building Permit - ADU",
      commercial: "Boston Demolition Permit",
      mixed_use: "Boston Building Permit - Mixed Use",
    };

    researchRequirements.mutate({
      projectId: createdProjectId,
      permitType: permitTypeMap[projectType] || "Boston Building Permit",
    });
  };

  const handleComplete = () => {
    completeOnboarding.mutate();
    setOpen(false);
    onClose?.();
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  };

  const handleClose = () => {
    completeOnboarding.mutate();
    setOpen(false);
    onClose?.();
  };

  const STEPS = [
    { num: 1, label: "Project" },
    { num: 2, label: "Jurisdiction" },
    { num: 3, label: "Requirements" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: '#1E293B', border: '1px solid rgba(20,184,166,0.3)' }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%`, background: '#14B8A6' }}
          />
        </div>

        <div className="p-8 overflow-y-auto">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-1">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step > s.num ? '#14B8A6' : step === s.num ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
                    color: step > s.num ? '#0F172A' : step === s.num ? '#14B8A6' : '#475569',
                    border: step === s.num ? '1px solid rgba(20,184,166,0.5)' : 'none',
                  }}
                >
                  {step > s.num ? <CheckCircle className="h-3.5 w-3.5" /> : s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-12" style={{ background: step > s.num ? '#14B8A6' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: What is your first project? */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                What is your first project?
              </h2>
              <p className="text-[#CBD5E1] mb-6">
                Enter the project address and type. We&apos;ll auto-detect jurisdiction and load permit requirements.
              </p>

              <div className="space-y-5 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[#E2E8F0] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Project Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street, Boston, MA 02118"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Project Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setProjectType(type.value as typeof projectType)}
                        className="flex flex-col items-start gap-1 px-4 py-3 rounded-lg text-left transition-all"
                        style={{
                          background: projectType === type.value ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.03)',
                          border: projectType === type.value ? '1px solid rgba(20,184,166,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                            style={{ borderColor: projectType === type.value ? '#14B8A6' : '#334155' }}
                          >
                            {projectType === type.value && (
                              <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#14B8A6' }} />
                            )}
                          </div>
                          <span className="font-semibold text-sm" style={{ color: projectType === type.value ? '#14B8A6' : '#F1F5F9' }}>
                            {type.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] ml-5">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStep1Continue}
                disabled={createProject.isPending}
                className="w-full bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
              >
                {createProject.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detecting Jurisdiction...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Jurisdiction Detection */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}
                >
                  <Building2 className="h-8 w-8 text-[#14B8A6]" />
                </div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                  Found: {detectedJurisdiction}
                </h2>
                <p className="text-[#CBD5E1]">
                  Here&apos;s what applies to your project
                </p>
              </div>

              <div
                className="rounded-xl p-5 mb-8"
                style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
              >
                <p className="text-sm font-semibold text-[#14B8A6] mb-3">What happens next:</p>
                <div className="space-y-2">
                  {[
                    "We&apos;ll load jurisdiction-specific permit requirements",
                    "Requirements are automatically organized by permit process",
                    "You&apos;ll see exactly what documents and steps are needed",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                      <CheckCircle className="h-4 w-4 text-[#14B8A6] mt-0.5 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStep2Continue}
                disabled={isGeneratingRequirements}
                className="w-full bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
              >
                {isGeneratingRequirements ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Requirements...
                  </>
                ) : (
                  <>
                    Load Requirements
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Requirements Timeline */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                Your Compliance Timeline
              </h2>
              <p className="text-[#CBD5E1] mb-6">
                {complianceItems.length} requirements loaded. You&apos;re ready to start tracking compliance.
              </p>

              {/* Compliance items preview */}
              <div
                className="rounded-xl overflow-hidden mb-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '300px', overflowY: 'auto' }}
              >
                {complianceItems.slice(0, 10).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3"
                    style={{ borderBottom: index < Math.min(complianceItems.length, 10) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  >
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(99,102,241,0.12)' }}
                    >
                      <FileCheck className="h-3.5 w-3.5 text-[#6366F1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] mb-0.5">
                        {item.description}
                      </p>
                      {item.deadline && (
                        <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                          <Clock className="h-3 w-3" />
                          <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {complianceItems.length > 10 && (
                  <div className="px-4 py-2 text-center text-xs text-[#64748B]">
                    +{complianceItems.length - 10} more requirements
                  </div>
                )}
              </div>

              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6] mb-2">
                  You&apos;re all set!
                </p>
                <p className="text-sm text-[#E2E8F0]">
                  Your project is ready. Start tracking compliance, uploading documents, and managing deadlines.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
              >
                Go to Project
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
