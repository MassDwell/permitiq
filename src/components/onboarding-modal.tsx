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
import { CheckCircle, ArrowRight, Upload, MapPin, Building2, Loader2 } from "lucide-react";

const STORAGE_KEY = "meritlayer-onboarding-complete";

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
  hasProjects?: boolean;
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingModal({ userName, hasProjects, forceOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [address, setAddress] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [projectType, setProjectType] = useState<
    "residential" | "commercial" | "adu" | "mixed_use" | "renovation"
  >("residential");

  const utils = trpc.useUtils();

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    // Only auto-open for users with no projects who haven't seen it
    if (hasProjects) return;
    const done = localStorage.getItem(STORAGE_KEY) === "true";
    if (!done) {
      setOpen(true);
    }
  }, [forceOpen, hasProjects]);

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      localStorage.setItem(STORAGE_KEY, "true");
      utils.projects.list.invalidate();
      toast.success("Project created! Let's get started.");
      handleClose();
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onClose?.();
  };

  const handleFinish = () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    createProject.mutate({
      name: projectName.trim(),
      address: address.trim() || undefined,
      jurisdiction: jurisdiction || undefined,
      projectType,
    });
  };

  const STEPS = [
    { num: 1, label: "Welcome" },
    { num: 2, label: "Project Details" },
    { num: 3, label: "Project Type" },
    { num: 4, label: "Next Steps" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="sm:max-w-[520px] p-0 overflow-hidden"
        style={{ background: '#0E1525', border: '1px solid rgba(20,184,166,0.3)' }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%`, background: '#14B8A6' }}
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
                    color: step > s.num ? '#080D1A' : step === s.num ? '#14B8A6' : '#475569',
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

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#14B8A6' }}>
                  Welcome to MeritLayer
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
                Hi{userName ? `, ${userName.split(' ')[0]}` : ""}! Let&apos;s create your first project.
              </h2>
              <p className="text-[#64748B] mb-8">
                MeritLayer tracks permit compliance so you never miss a deadline. This only takes 2 minutes.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Building2, text: "Track compliance items across all your projects" },
                  { icon: Upload, text: "Upload permit docs — AI extracts requirements automatically" },
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
                onClick={() => setStep(2)}
                className="w-full bg-[#14B8A6] text-[#080D1A] hover:bg-[#0D9488] font-semibold"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Address + Jurisdiction */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-1">Where is your project?</h2>
              <p className="text-[#64748B] text-sm mb-6">We&apos;ll use this to load jurisdiction-specific permit requirements.</p>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="ob-name" className="text-[#94A3B8]">Project Name *</Label>
                  <Input
                    id="ob-name"
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
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 text-[#94A3B8]">
                  Back
                </Button>
                <Button
                  onClick={() => { if (!projectName.trim()) { toast.error("Project name is required"); return; } setStep(3); }}
                  className="flex-1 bg-[#14B8A6] text-[#080D1A] hover:bg-[#0D9488] font-semibold"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Project Type */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-1">What type of project is this?</h2>
              <p className="text-[#64748B] text-sm mb-6">This helps us load the right compliance requirements.</p>

              <div className="grid grid-cols-1 gap-2 mb-8">
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProjectType(opt.value as typeof projectType)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                    style={{
                      background: projectType === opt.value ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.03)',
                      border: projectType === opt.value ? '1px solid rgba(20,184,166,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: projectType === opt.value ? '#14B8A6' : '#94A3B8',
                    }}
                  >
                    <div
                      className="h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: projectType === opt.value ? '#14B8A6' : '#334155' }}
                    >
                      {projectType === opt.value && (
                        <div className="h-2 w-2 rounded-full" style={{ background: '#14B8A6' }} />
                      )}
                    </div>
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/10 text-[#94A3B8]">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-[#14B8A6] text-[#080D1A] hover:bg-[#0D9488] font-semibold"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Doc Upload Hint */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-1">One more thing...</h2>
              <p className="text-[#64748B] text-sm mb-6">
                After creating your project, upload a permit document to unlock AI-powered compliance extraction.
              </p>

              <div
                className="rounded-xl p-5 mb-8"
                style={{ background: 'rgba(20,184,166,0.06)', border: '1px dashed rgba(20,184,166,0.3)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(20,184,166,0.15)' }}>
                    <Upload className="h-5 w-5 text-[#14B8A6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#F1F5F9] mb-1">Upload Your First Permit Doc</p>
                    <p className="text-sm text-[#64748B]">
                      Drag &amp; drop a PDF, building permit, or inspection report. Our AI will automatically extract requirements, deadlines, and conditions.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-4 mb-8 text-sm text-[#64748B]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="font-medium text-[#94A3B8] mb-1">Creating project:</p>
                <p className="text-[#F1F5F9] font-semibold">{projectName}</p>
                {address && <p className="text-xs mt-0.5">{address}</p>}
                {jurisdiction && <p className="text-xs mt-0.5">{JURISDICTION_OPTIONS.find(j => j.value === jurisdiction)?.label ?? jurisdiction}</p>}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 border-white/10 text-[#94A3B8]">
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={createProject.isPending}
                  className="flex-1 bg-[#14B8A6] text-[#080D1A] hover:bg-[#0D9488] font-semibold"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
