"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Upload,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const PERMIT_CATEGORY_LABELS: Record<string, string> = {
  building: "Building Permit",
  demolition: "Demolition Permit",
  electrical: "Electrical Permit",
  plumbing: "Plumbing Permit",
  gas: "Gas Permit",
  hvac: "HVAC / Mechanical Permit",
  zba_variance: "ZBA Variance",
  article_80_small: "Article 80 Small Project Review",
  article_80_large: "Article 80 Large Project Review",
  bpda_review: "BPDA Review",
  foundation: "Foundation Permit",
  excavation: "Excavation Permit",
  certificate_of_occupancy: "Certificate of Occupancy",
  other: "Other Permit",
};

function StatusIcon({ status, critical }: { status: "uploaded" | "missing"; critical: boolean }) {
  if (status === "uploaded") {
    return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
  }
  if (critical) {
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  }
  return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
}

function PermitChecklist({
  checklist,
  projectId,
}: {
  checklist: {
    permitWorkflowId: string;
    permitCategory: string;
    permitName: string;
    permitStatus: string;
    items: Array<{
      id: string;
      label: string;
      critical: boolean;
      status: "uploaded" | "missing";
      documentId?: string;
      documentFilename?: string;
    }>;
    uploadedCount: number;
    totalCount: number;
    criticalMissingCount: number;
    readyToSubmit: boolean;
  };
  projectId: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const progressPct = checklist.totalCount > 0
    ? Math.round((checklist.uploadedCount / checklist.totalCount) * 100)
    : 100;

  const statusLabel = PERMIT_CATEGORY_LABELS[checklist.permitCategory] ?? checklist.permitCategory;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{checklist.permitName}</span>
              <Badge variant="outline" className="text-xs">{statusLabel}</Badge>
              {checklist.readyToSubmit ? (
                <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>
              ) : checklist.criticalMissingCount > 0 ? (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {checklist.criticalMissingCount} critical missing
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Optional docs missing</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {checklist.uploadedCount} of {checklist.totalCount} documents uploaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Progress value={progressPct} className="w-24 h-2" />
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{progressPct}%</span>
        </div>
      </button>

      {/* Items */}
      {expanded && (
        <div className="divide-y">
          {checklist.items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                item.status === "missing" && item.critical
                  ? "bg-red-50"
                  : item.status === "missing"
                  ? "bg-yellow-50"
                  : "bg-white"
              }`}
            >
              <StatusIcon status={item.status} critical={item.critical} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    item.status === "uploaded" ? "text-gray-700" :
                    item.critical ? "text-red-700" : "text-yellow-700"
                  }`}>
                    {item.label}
                  </span>
                  {item.critical && item.status === "missing" && (
                    <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                  )}
                  {!item.critical && item.status === "missing" && (
                    <Badge className="bg-gray-100 text-gray-600 text-xs">Optional</Badge>
                  )}
                </div>
                {item.documentFilename && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {item.documentFilename}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.status === "uploaded" && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Uploaded</Badge>
                )}
                {item.status === "missing" && (
                  <Link href={`/projects/${projectId}?tab=documents`}>
                    <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      Upload
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SubmissionPrepChecklistProps {
  projectId: string;
}

export function SubmissionPrepChecklist({ projectId }: SubmissionPrepChecklistProps) {
  const { data, isLoading } = trpc.jurisdictionRules.getSubmissionChecklist.useQuery({ projectId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.checklists.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No permits to prepare for yet</h3>
          <p className="text-gray-500 text-sm">
            Add permit workflows on the Permits tab to track required documents per permit type.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Document Coverage</CardTitle>
          <CardDescription>
            Track required documents across all active permits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall document coverage</span>
                <span className="text-sm font-semibold">
                  {data.totalUploaded} / {data.totalRequired} documents
                </span>
              </div>
              <Progress value={data.overallPercent} className="h-3" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{data.overallPercent}%</p>
              <p className="text-xs text-gray-500">complete</p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {data.checklists.filter((c) => c.readyToSubmit).length > 0 && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {data.checklists.filter((c) => c.readyToSubmit).length} permit{data.checklists.filter((c) => c.readyToSubmit).length > 1 ? "s" : ""} ready
              </Badge>
            )}
            {data.checklists.reduce((sum, c) => sum + c.criticalMissingCount, 0) > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                {data.checklists.reduce((sum, c) => sum + c.criticalMissingCount, 0)} critical docs missing
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-permit checklists */}
      <div className="space-y-4">
        {data.checklists.map((checklist) => (
          <PermitChecklist key={checklist.permitWorkflowId} checklist={checklist} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}
