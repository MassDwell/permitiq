"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface ComplianceItem {
  id: string;
  description: string;
  status: string;
  updatedAt: Date | string;
  deadline?: Date | string | null;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  complianceItems: ComplianceItem[];
}

interface UpcomingDeadlineItem {
  id: string;
  description: string;
  deadline?: Date | string | null;
  projectId: string;
  project: { name: string };
}

type ActivityEvent =
  | {
      type: "completed";
      id: string;
      label: string;
      projectName: string;
      projectId: string;
      time: Date;
    }
  | {
      type: "deadline";
      id: string;
      label: string;
      projectName: string;
      projectId: string;
      daysUntil: number;
      time: Date;
    }
  | {
      type: "overdue";
      id: string;
      label: string;
      projectName: string;
      projectId: string;
      time: Date;
    };

interface ActivityFeedProps {
  projects: Project[];
  upcomingDeadlines: UpcomingDeadlineItem[];
}

export function ActivityFeed({ projects, upcomingDeadlines }: ActivityFeedProps) {
  const now = new Date();

  const events: ActivityEvent[] = [];

  // Recently completed compliance items (last 14 days)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  for (const project of projects) {
    for (const item of project.complianceItems) {
      if (
        item.status === "met" &&
        new Date(item.updatedAt) >= fourteenDaysAgo
      ) {
        events.push({
          type: "completed",
          id: `completed-${item.id}`,
          label: item.description,
          projectName: project.name,
          projectId: project.id,
          time: new Date(item.updatedAt),
        });
      }
      if (item.status === "overdue") {
        events.push({
          type: "overdue",
          id: `overdue-${item.id}`,
          label: item.description,
          projectName: project.name,
          projectId: project.id,
          time: new Date(item.updatedAt),
        });
      }
    }
  }

  // Upcoming deadlines within 14 days
  for (const item of upcomingDeadlines) {
    if (!item.deadline) continue;
    const deadline = new Date(item.deadline);
    const daysUntil = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 14) {
      events.push({
        type: "deadline",
        id: `deadline-${item.id}`,
        label: item.description,
        projectName: item.project.name,
        projectId: item.projectId,
        daysUntil,
        time: deadline,
      });
    }
  }

  // Sort: deadlines first (soonest), then by time desc
  events.sort((a, b) => {
    if (a.type === "deadline" && b.type !== "deadline") return -1;
    if (a.type !== "deadline" && b.type === "deadline") return 1;
    if (a.type === "deadline" && b.type === "deadline") {
      return a.time.getTime() - b.time.getTime();
    }
    return b.time.getTime() - a.time.getTime();
  });

  const visible = events.slice(0, 10);

  if (visible.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "rgba(100,116,139,0.3)" }} />
        <p className="text-sm text-[#475569]">No recent activity</p>
        <p className="text-xs text-[#334155] mt-1">
          Activity appears once you have projects with compliance items.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {visible.map((event) => (
        <Link key={event.id} href={`/projects/${event.projectId}`} className="block">
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer">
            <div className="mt-0.5 shrink-0">
              {event.type === "completed" && (
                <CheckCircle className="h-4 w-4 text-[#14B8A6]" />
              )}
              {event.type === "deadline" && (
                <Clock
                  className={`h-4 w-4 ${
                    event.daysUntil <= 3
                      ? "text-red-400"
                      : event.daysUntil <= 7
                      ? "text-amber-400"
                      : "text-[#64748B]"
                  }`}
                />
              )}
              {event.type === "overdue" && (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#E2E8F0] leading-snug">
                <span className="font-medium text-[#94A3B8]">{event.projectName}</span>
                {event.type === "completed" && (
                  <span className="text-[#64748B]"> — Compliance item marked complete</span>
                )}
                {event.type === "overdue" && (
                  <span className="text-red-400"> — Item overdue</span>
                )}
                {event.type === "deadline" && (
                  <span
                    className={
                      event.daysUntil <= 3
                        ? " text-red-400 font-medium"
                        : event.daysUntil <= 7
                        ? " text-amber-400"
                        : " text-[#64748B]"
                    }
                  >
                    {" "}
                    — Deadline in {event.daysUntil} day{event.daysUntil !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <p className="text-xs text-[#334155] mt-0.5 truncate">{event.label}</p>
            </div>
            <span className="text-xs text-[#334155] shrink-0 mt-0.5">
              {event.type === "deadline"
                ? `in ${event.daysUntil}d`
                : formatDistanceToNow(event.time, { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
