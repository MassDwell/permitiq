"use client";

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Check,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

function getAlertIcon(type: string) {
  switch (type) {
    case "deadline_1_day":
      return <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />;
    case "deadline_3_days":
      return <Clock className="h-5 w-5 text-orange-400 shrink-0" />;
    case "deadline_7_days":
      return <Clock className="h-5 w-5 text-amber-400 shrink-0" />;
    case "overdue":
      return <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />;
    case "document_processed":
      return <CheckCircle className="h-5 w-5 text-teal-400 shrink-0" />;
    default:
      return <Bell className="h-5 w-5 text-[#14B8A6] shrink-0" />;
  }
}

function getAlertBadge(type: string) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  switch (type) {
    case "deadline_1_day":
      return <span className={base} style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>Due Tomorrow</span>;
    case "deadline_3_days":
      return <span className={base} style={{ background: 'rgba(249,115,22,0.15)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.3)' }}>Due in 3 Days</span>;
    case "deadline_7_days":
      return <span className={base} style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.3)' }}>Due in 7 Days</span>;
    case "overdue":
      return <span className={base} style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>Overdue</span>;
    case "document_processed":
      return <span className={base} style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}>Processed</span>;
    default:
      return <span className={base} style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.12)' }}>Update</span>;
  }
}

export default function AlertsPage() {
  const utils = trpc.useUtils();

  const { data: alerts, isLoading } = trpc.alerts.list.useQuery({
    limit: 100,
  });

  const markAsRead = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.getUnreadCount.invalidate();
    },
  });

  const markAllAsRead = trpc.alerts.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.getUnreadCount.invalidate();
      toast.success("All alerts marked as read");
    },
  });

  const deleteAlert = trpc.alerts.delete.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.getUnreadCount.invalidate();
      toast.success("Alert deleted");
    },
  });

  const deleteAllAlerts = trpc.alerts.deleteAll.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.getUnreadCount.invalidate();
      toast.success("All alerts deleted");
    },
  });

  const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Alerts</h1>
          <p className="text-[#64748B] mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
              : "No unread alerts"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}
              className="hover:bg-white/5"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {alerts && alerts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Are you sure you want to delete all alerts?")) {
                  deleteAllAlerts.mutate();
                }
              }}
              disabled={deleteAllAlerts.isPending}
              style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#F87171' }}
              className="hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-semibold text-[#F1F5F9]">All Alerts</h2>
          <p className="text-sm text-[#475569] mt-0.5">Deadline alerts and compliance updates</p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-lg transition-colors"
                  style={{
                    background: !alert.isRead ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.02)',
                    border: !alert.isRead ? '1px solid rgba(20,184,166,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {getAlertIcon(alert.alertType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getAlertBadge(alert.alertType)}
                      {!alert.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#F1F5F9]">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#475569] flex-wrap">
                      {alert.project && (
                        <Link
                          href={`/projects/${alert.project.id}`}
                          className="flex items-center gap-1 hover:text-[#14B8A6] transition-colors"
                        >
                          {alert.project.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      {alert.complianceItem?.deadline && (
                        <span>
                          Deadline:{" "}
                          {format(
                            new Date(alert.complianceItem.deadline),
                            "MMM d, yyyy"
                          )}
                        </span>
                      )}
                      <span>
                        {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead.mutate({ id: alert.id })}
                        className="p-1.5 rounded-md text-[#475569] hover:text-[#14B8A6] hover:bg-white/5 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert.mutate({ id: alert.id })}
                      className="p-1.5 rounded-md text-[#475569] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(20,184,166,0.1)' }}
              >
                <ShieldCheck className="h-8 w-8 text-[#14B8A6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">
                You&apos;re all clear
              </h3>
              <p className="text-[#475569] text-sm max-w-xs mx-auto">
                No upcoming deadlines or alerts. You&apos;ll be notified when deadlines approach or documents are processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
