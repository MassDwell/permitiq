"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, CheckCircle } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  features?: string[];
}

const DEFAULT_FEATURES = [
  "Unlimited projects",
  "AI Chat for every project",
  "Team collaboration & sharing",
  "Priority deadline alerts",
  "Compliance reports & exports",
];

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Upgrade to Professional",
  description,
  features = DEFAULT_FEATURES,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[440px]"
        style={{ background: '#1E293B', border: '1px solid rgba(20,184,166,0.3)' }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(20,184,166,0.15)' }}
            >
              <Zap className="h-4 w-4 text-[#14B8A6]" />
            </div>
            <DialogTitle className="text-[#F1F5F9]">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-[#CBD5E1]">
            {description ?? "You've reached your plan limit. Upgrade to Professional for unlimited access."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div
            className="rounded-xl p-4 space-y-2.5"
            style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}
          >
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[#E2E8F0]">
                <CheckCircle className="h-4 w-4 text-[#14B8A6] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#64748B' }}
            className="hover:bg-white/5"
          >
            Maybe Later
          </Button>
          <Button
            asChild
            style={{ background: '#14B8A6', color: '#0F172A' }}
            className="hover:bg-[#0D9488] font-semibold"
          >
            <a href="/pricing">
              View Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
