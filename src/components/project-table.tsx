"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

// Type for project data from tRPC
interface ComplianceItem {
  id: string;
  status: string;
  deadline: Date | null;
  description: string;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  address: string | null;
  jurisdiction: string | null;
  healthScore: number;
  healthStatus: "green" | "yellow" | "red";
  overdueItems: number;
  updatedAt: Date;
  complianceItems: ComplianceItem[];
}

type SortField = "project" | "jurisdiction" | "readiness" | "deadline" | "blocking" | "updated" | "urgency";
type SortDirection = "asc" | "desc";

interface ProjectTableProps {
  projects: Project[];
}

function getReadinessColor(score: number): string {
  if (score < 40) return "#EF4444"; // red
  if (score <= 75) return "#F59E0B"; // amber
  return "#14B8A6"; // green/teal
}

function getNextDeadline(complianceItems: ComplianceItem[]): Date | null {
  const now = new Date();
  const upcomingDeadlines = complianceItems
    .filter((item) => item.status !== "met" && item.status !== "not_applicable" && item.deadline)
    .map((item) => new Date(item.deadline!))
    .filter((d) => d >= now)
    .sort((a, b) => a.getTime() - b.getTime());

  return upcomingDeadlines[0] || null;
}

function getBlockingStep(complianceItems: ComplianceItem[]): string | null {
  const blocking = complianceItems.find(
    (item) => item.status !== "met" && item.status !== "not_applicable"
  );
  return blocking?.description || null;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "\u2026";
}

function formatDeadline(date: Date | null): string {
  if (!date) return "None";
  return format(date, "MMM d");
}

function getUrgencyScore(project: Project): number {
  // Higher score = more urgent (shows first)
  const now = new Date();

  // Overdue items: highest urgency
  if (project.overdueItems > 0) {
    return 1000 + project.overdueItems;
  }

  const nextDeadline = getNextDeadline(project.complianceItems);
  if (nextDeadline) {
    const daysUntil = differenceInDays(nextDeadline, now);
    if (daysUntil <= 7) {
      return 500 + (7 - daysUntil); // Within 7 days
    }
    return 100 - Math.min(daysUntil, 100); // Has deadline, further out
  }

  // No deadline
  return 0;
}

function getRowStyle(project: Project): { borderColor: string; bgColor: string } {
  const now = new Date();

  // Overdue: red styling
  if (project.overdueItems > 0) {
    return {
      borderColor: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.08)",
    };
  }

  // Deadline within 7 days: amber styling
  const nextDeadline = getNextDeadline(project.complianceItems);
  if (nextDeadline) {
    const daysUntil = differenceInDays(nextDeadline, now);
    if (daysUntil <= 7) {
      return {
        borderColor: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.08)",
      };
    }
  }

  // Normal
  return {
    borderColor: "transparent",
    bgColor: "transparent",
  };
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>("urgency");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "urgency" ? "desc" : "asc");
    }
  };

  const sortedProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "project":
          comparison = a.name.localeCompare(b.name);
          break;
        case "jurisdiction":
          comparison = (a.jurisdiction || "").localeCompare(b.jurisdiction || "");
          break;
        case "readiness":
          comparison = a.healthScore - b.healthScore;
          break;
        case "deadline": {
          const deadlineA = getNextDeadline(a.complianceItems);
          const deadlineB = getNextDeadline(b.complianceItems);
          if (!deadlineA && !deadlineB) comparison = 0;
          else if (!deadlineA) comparison = 1;
          else if (!deadlineB) comparison = -1;
          else comparison = deadlineA.getTime() - deadlineB.getTime();
          break;
        }
        case "blocking": {
          const blockingA = getBlockingStep(a.complianceItems) || "";
          const blockingB = getBlockingStep(b.complianceItems) || "";
          comparison = blockingA.localeCompare(blockingB);
          break;
        }
        case "updated":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "urgency":
        default:
          comparison = getUrgencyScore(a) - getUrgencyScore(b);
          // Secondary sort by updated desc when urgency is equal
          if (comparison === 0) {
            comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [projects, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
  };

  const headerClass = "cursor-pointer select-none hover:text-[#F1F5F9] transition-colors text-[#94A3B8] text-xs font-medium uppercase tracking-wider";

  return (
    <Table>
      <TableHeader>
        <TableRow
          className="border-b hover:bg-transparent"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <TableHead
            className={headerClass}
            onClick={() => handleSort("project")}
          >
            Project
            <SortIcon field="project" />
          </TableHead>
          <TableHead
            className={headerClass}
            onClick={() => handleSort("jurisdiction")}
          >
            Jurisdiction
            <SortIcon field="jurisdiction" />
          </TableHead>
          <TableHead
            className={headerClass}
            onClick={() => handleSort("readiness")}
          >
            Permit Readiness
            <SortIcon field="readiness" />
          </TableHead>
          <TableHead
            className={headerClass}
            onClick={() => handleSort("deadline")}
          >
            Next Deadline
            <SortIcon field="deadline" />
          </TableHead>
          <TableHead
            className={headerClass}
            onClick={() => handleSort("blocking")}
          >
            Blocking Step
            <SortIcon field="blocking" />
          </TableHead>
          <TableHead
            className={headerClass}
            onClick={() => handleSort("updated")}
          >
            Updated
            <SortIcon field="updated" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedProjects.map((project) => {
          const rowStyle = getRowStyle(project);
          const nextDeadline = getNextDeadline(project.complianceItems);
          const blockingStep = getBlockingStep(project.complianceItems);
          const readinessColor = getReadinessColor(project.healthScore);

          return (
            <TableRow
              key={project.id}
              className="border-b transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                borderLeftWidth: "3px",
                borderLeftColor: rowStyle.borderColor,
                backgroundColor: rowStyle.bgColor,
              }}
            >
              <TableCell className="py-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="font-medium text-[#F1F5F9] text-sm">
                    {project.name}
                  </div>
                  <div className="text-xs text-[#64748B] truncate max-w-[200px]">
                    {project.address || "No address"}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="py-3">
                {project.jurisdiction ? (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(99, 102, 241, 0.15)",
                      color: "#A5B4FC",
                    }}
                  >
                    {project.jurisdiction}
                  </span>
                ) : (
                  <span className="text-xs text-[#64748B]">-</span>
                )}
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: readinessColor,
                      boxShadow: `0 0 6px ${readinessColor}60`,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: readinessColor }}
                  >
                    {project.healthScore}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <span
                  className={`text-sm ${
                    nextDeadline ? "text-[#F1F5F9]" : "text-[#64748B]"
                  }`}
                >
                  {formatDeadline(nextDeadline)}
                </span>
              </TableCell>
              <TableCell className="py-3">
                {blockingStep ? (
                  <span className="text-sm text-[#CBD5E1]">
                    {truncate(blockingStep, 50)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-[#14B8A6]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    All clear
                  </span>
                )}
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-[#64748B]">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
