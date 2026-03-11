"use client";

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

function getAlertIcon(type: string) {
  switch (type) {
    case "deadline_1_day":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "deadline_3_days":
      return <Clock className="h-5 w-5 text-orange-500" />;
    case "deadline_7_days":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "overdue":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case "document_processed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
}

function getAlertBadge(type: string) {
  switch (type) {
    case "deadline_1_day":
      return <Badge className="bg-red-100 text-red-800">Due Tomorrow</Badge>;
    case "deadline_3_days":
      return <Badge className="bg-orange-100 text-orange-800">Due in 3 Days</Badge>;
    case "deadline_7_days":
      return <Badge className="bg-yellow-100 text-yellow-800">Due in 7 Days</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    case "document_processed":
      return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
    default:
      return <Badge variant="secondary">Update</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 mt-1">
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
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>
            Deadline alerts and compliance updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    !alert.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  {getAlertIcon(alert.alertType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getAlertBadge(alert.alertType)}
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {alert.project && (
                        <Link
                          href={`/projects/${alert.project.id}`}
                          className="flex items-center gap-1 hover:text-blue-600"
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
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead.mutate({ id: alert.id })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAlert.mutate({ id: alert.id })}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No alerts yet
              </h3>
              <p className="text-gray-500">
                You'll receive alerts when deadlines are approaching or documents
                are processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
