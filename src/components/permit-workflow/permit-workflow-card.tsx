"use client";

import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Zap,
  Wrench,
  Flame,
  Wind,
  Scale,
  FileSearch,
  ClipboardList,
  HardHat,
  Shovel,
  KeyRound,
  FileText,
  User,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

export const PERMIT_CATEGORY_LABELS: Record<string, string> = {
  building: "Building Permit",
  demolition: "Demolition Permit",
  electrical: "Electrical Permit",
  plumbing: "Plumbing Permit",
  gas: "Gas Permit",
  hvac: "HVAC Permit",
  zba_variance: "ZBA Variance",
  article_80_small: "Article 80 Small Project Review",
  article_80_large: "Article 80 Large Project Review",
  bpda_review: "BPDA Development Review",
  foundation: "Foundation Permit",
  excavation: "Excavation Permit",
  certificate_of_occupancy: "Certificate of Occupancy",
  other: "Other Permit",
};

function getCategoryIcon(category: string) {
  const cls = "h-5 w-5";
  switch (category) {
    case "building": return <Building2 className={cls} />;
    case "demolition": return <HardHat className={cls} />;
    case "electrical": return <Zap className={cls} />;
    case "plumbing": return <Wrench className={cls} />;
    case "gas": return <Flame className={cls} />;
    case "hvac": return <Wind className={cls} />;
    case "zba_variance": return <Scale className={cls} />;
    case "article_80_small":
    case "article_80_large": return <FileSearch className={cls} />;
    case "bpda_review": return <ClipboardList className={cls} />;
    case "foundation": return <Building2 className={cls} />;
    case "excavation": return <Shovel className={cls} />;
    case "certificate_of_occupancy": return <KeyRound className={cls} />;
    default: return <FileText className={cls} />;
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "not_started":
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Started</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>;
    case "submitted":
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Submitted</Badge>;
    case "under_review":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Under Review</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    case "on_hold":
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">On Hold</Badge>;
    default:
      return null;
  }
}

interface PermitWorkflowCardProps {
  workflow: {
    id: string;
    permitCategory: string;
    permitName: string;
    jurisdiction: string | null;
    status: string;
    assignedTo: string | null;
    dueDate: Date | null;
    commentCount: number;
  };
  onViewDetails: (id: string) => void;
}

export function PermitWorkflowCard({ workflow, onViewDetails }: PermitWorkflowCardProps) {
  const isOverdue =
    workflow.dueDate &&
    isPast(new Date(workflow.dueDate)) &&
    !["approved", "rejected"].includes(workflow.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            {getCategoryIcon(workflow.permitCategory)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{workflow.permitName}</p>
                {workflow.jurisdiction && (
                  <p className="text-sm text-gray-500 truncate">{workflow.jurisdiction}</p>
                )}
              </div>
              <div className="flex-shrink-0">{getStatusBadge(workflow.status)}</div>
            </div>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {workflow.assignedTo && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <User className="h-3.5 w-3.5" />
                  {workflow.assignedTo}
                </span>
              )}
              {workflow.dueDate && (
                <span
                  className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {isOverdue ? "Overdue · " : "Due "}
                  {format(new Date(workflow.dueDate), "MMM d, yyyy")}
                </span>
              )}
              {workflow.commentCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {workflow.commentCount}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={() => onViewDetails(workflow.id)}
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
