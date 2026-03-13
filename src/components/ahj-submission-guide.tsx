"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Clock,
  Phone,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AHJ_DATA, getRelevantAHJs, type AHJData } from "@/lib/ahj-data";

interface ComplianceItemType {
  requirementType: string;
}

interface AHJSubmissionGuideProps {
  jurisdiction: string;
  complianceItems: ComplianceItemType[];
}

function AHJInfoCard({
  ahj,
  ahjKey,
  projectAddress,
}: {
  ahj: AHJData;
  ahjKey: string;
  projectAddress?: string;
}) {
  const copyEmail = () => {
    if (!ahj.emailTemplate) return;
    const filled = ahj.emailTemplate.replace(
      /\[PROJECT ADDRESS\]/g,
      projectAddress || "[PROJECT ADDRESS]"
    );
    navigator.clipboard.writeText(filled);
    toast.success("Email template copied to clipboard");
  };

  const copyEmailAddress = () => {
    if (!ahj.email) return;
    navigator.clipboard.writeText(ahj.email);
    toast.success("Email address copied");
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-slate-100">{ahj.name}</h4>
        {ahj.portal && (
          <a
            href={ahj.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 hover:underline shrink-0"
          >
            <Globe className="h-3 w-3" />
            Portal
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        {ahj.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <span>{ahj.address}</span>
          </div>
        )}
        {ahj.hours && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{ahj.hours}</span>
          </div>
        )}
        {ahj.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-500 shrink-0" />
            <a href={`tel:${ahj.phone}`} className="hover:text-teal-400">
              {ahj.phone}
            </a>
          </div>
        )}
        {ahj.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500 shrink-0" />
            <a
              href={`mailto:${ahj.email}`}
              className="hover:text-teal-400 text-teal-400"
            >
              {ahj.email}
            </a>
            <button
              onClick={copyEmailAddress}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Copy email address"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {ahj.emailTemplate && (
        <div className="pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={copyEmail}
            className="w-full bg-teal-900/30 border-teal-700 text-teal-300 hover:bg-teal-900/50 hover:text-teal-200"
          >
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copy Email Template
          </Button>
        </div>
      )}
    </div>
  );
}

export function AHJSubmissionGuide({
  jurisdiction,
  complianceItems,
}: AHJSubmissionGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const requirementTypes = complianceItems.map((item) => item.requirementType);
  const relevantAHJs = getRelevantAHJs(jurisdiction, requirementTypes);

  if (relevantAHJs.length === 0) {
    return null;
  }

  // Find the AHJ keys for the relevant AHJs
  const ahjEntries = Object.entries(AHJ_DATA).filter(([, data]) =>
    relevantAHJs.includes(data)
  );

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-base text-slate-100 flex items-center gap-2">
            <Globe className="h-4 w-4 text-teal-400" />
            How to Submit
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
        {!isExpanded && (
          <p className="text-sm text-slate-400 mt-1">
            {relevantAHJs.length} relevant{" "}
            {relevantAHJs.length === 1 ? "office" : "offices"} for your permit
            submissions
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-2">
          <p className="text-sm text-slate-400 mb-3">
            Contact these offices to submit permits or check application status.
            Use the email templates to follow up on pending submissions.
          </p>
          {ahjEntries.map(([key, ahj]) => (
            <AHJInfoCard key={key} ahj={ahj} ahjKey={key} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
