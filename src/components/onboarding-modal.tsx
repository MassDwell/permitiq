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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, ArrowRight, Upload, MapPin, Building2, Loader2, PartyPopper } from "lucide-react";

const JURISDICTION_OPTIONS = [
  { value: "BOSTON_ISD", label: "Boston, MA (ISD)" },
  { value: "BOSTON_BPDA", label: "Boston, MA (BPDA)" },
  { value: "BOSTON_ZBA", label: "Boston, MA (ZBA)" },
  { value: "CAMBRIDGE_MA", label: "Cambridge, MA" },
  { value: "SOMERVILLE_MA", label: "Somerville, MA" },
  { value: "NEWTON_MA", label: "Newton, MA" },
  { value: "BROOKLINE_MA", label: "Brookline, MA" },
  { value: "QUINCY_MA", label: "Quincy, MA" },
  { value: "MA_GENERIC", label: "Generic MA" },
  { value: "other", label: "Other / Unknown" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "adu", label: "ADU (Accessory Dwelling Unit)" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "renovation", label: "Renovation" },
];

interface OnboardingModalProps {
  userName?: string | null;
  /** If true, show the modal regardless of completion status (admin/debug) */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingModal({ userName, forceOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectName, setCreatedProjectName] = useState("");

  // Step 1 fields
  const [name, setName] = useState(userName ?? "");
  const [company, setCompany] = useState("");

  // Step 2 fields
  const [projectName, setProjectName] = useState("");
  const [address, setAddress] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [projectType, setProjectType] = useState<
    "residential" | "commercial" | "adu" | "mixed_use" | "renovation"
  >("residential");

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

  // Sync userName into local name state when it arrives
  useEffect(() => {
    if (userName && !name) setName(userName);
  }, [userName]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeOnboarding = trpc.settings.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.settings.getProfile.invalidate();
    },
  });

  const updateProfile = trpc.settings.updateProfile.useMutation();

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      setCreatedProjectId(project.id);
      setCreatedProjectName(project.name);
      completeOnboarding.mutate();
      utils.projects.list.invalidate();
      setStep(3);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    completeOnboarding.mutate();
    setOpen(false);
    onClose?.();
  };

  const handleStep1Continue = () => {
    if (name.trim()) {
      updateProfile.mutate({ name: name.trim() });
    }
    setStep(2);
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    createProject.mutate({
      name: projectName.trim(),
      address: address.trim() || undefined,
      jurisdiction: jurisdiction || undefined,
      projectType,
      description: company.trim() ? `Company: ${company.trim()}` : undefined,
    });
  };

  const STEPS = [
    { num: 1, label: "Welcome" },
    { num: 2, label: "Project" },
    { num: 3, label: "All Set!" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="sm:max-w-[520px] p-0 overflow-hidden"
        style={{ background: '#1E293B', border: '1px solid rgba(20,184,166,0.3)' }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%`, background: '#14B8A6' }}
          />
        </div>

        <div className="p-8">
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
                  <div className="h-px w-8" style={{ background: step > s.num ? '#14B8A6' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Welcome + name/company */}
          {step === 1 && (
            <div>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#14B8A6' }}>
                  Welcome to MeritLayer
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                Let&apos;s get you set up
              </h2>
              <p className="text-[#64748B] mb-6">
                MeritLayer tracks permit compliance so you never miss a deadline. This takes 2 minutes.
              </p>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="ob-name" className="text-[#94A3B8]">Your name</Label>
                  <Input
                    id="ob-name"
                    placeholder="e.g., Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ob-company" className="text-[#94A3B8]">
                    Company <span className="text-[#475569] font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="ob-company"
                    placeholder="e.g., Acme Development LLC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Building2, text: "Track compliance across all your projects" },
                  { icon: Upload, text: "AI extracts requirements from permit docs automatically" },
                  { icon: CheckCircle, text: "Get deadline alerts before they become problems" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-[#94A3B8]">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(20,184,166,0.12)' }}>
                      <Icon className="h-3.5 w-3.5 text-[#14B8A6]" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleStep1Continue}
                className="w-full bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Create first project */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-1">Create your first project</h2>
              <p className="text-[#64748B] text-sm mb-6">
                We&apos;ll load jurisdiction-specific permit requirements automatically.
              </p>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="ob-proj-name" className="text-[#94A3B8]">Project name *</Label>
                  <Input
                    id="ob-proj-name"
                    placeholder="e.g., 123 Main St Renovation"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ob-address" className="text-[#94A3B8]">
                    <MapPin className="h-3.5 w-3.5 inline mr-1" />
                    Address
                  </Label>
                  <Input
                    id="ob-address"
                    placeholder="Full project address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Jurisdiction</Label>
                  <Select value={jurisdiction} onValueChange={setJurisdiction}>
                    <SelectTrigger style={{ background: '#141C2E', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9' }}>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {JURISDICTION_OPTIONS.map((j) => (
                        <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Project type</Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PROJECT_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setProjectType(opt.value as typeof projectType)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{
                          background: projectType === opt.value ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.03)',
                          border: projectType === opt.value ? '1px solid rgba(20,184,166,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: projectType === opt.value ? '#14B8A6' : '#94A3B8',
                        }}
                      >
                        <div
                          className="h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: projectType === opt.value ? '#14B8A6' : '#334155' }}
                        >
                          {projectType === opt.value && (
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#14B8A6' }} />
                          )}
                        </div>
                        <span className="font-medium text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 text-[#94A3B8]">
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProject.isPending}
                  className="flex-1 bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
                >
                  {createProject.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: All set! */}
          {step === 3 && (
            <div className="text-center">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}
              >
                <PartyPopper className="h-8 w-8 text-[#14B8A6]" />
              </div>

              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">You&apos;re all set!</h2>
              <p className="text-[#64748B] mb-6">
                {createdProjectName
                  ? `"${createdProjectName}" has been created. Upload your first permit doc to activate AI compliance extraction.`
                  : "Your account is ready. Upload a permit document to get started."}
              </p>

              <div
                className="rounded-xl p-4 mb-8 text-left"
                style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6] mb-3">Next steps</p>
                {[
                  "Upload a permit, inspection report, or building plan",
                  "AI will extract requirements and deadlines automatically",
                  "Set up alerts to stay ahead of compliance deadlines",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ background: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#94A3B8]">{step}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                  if (createdProjectId) {
                    router.push(`/projects/${createdProjectId}`);
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="w-full bg-[#14B8A6] text-[#0F172A] hover:bg-[#0D9488] font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
