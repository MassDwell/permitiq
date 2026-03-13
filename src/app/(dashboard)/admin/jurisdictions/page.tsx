"use client";

import { trpc } from "@/lib/trpc/client";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "steve.vettori@massdwell.com";

function StatusBadge({ status }: { status: string | null }) {
  if (status === "completed") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.25)", color: "#5EEAD4" }}
      >
        <CheckCircle2 className="h-3 w-3" />
        Curated
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#A5B4FC" }}
      >
        <Clock className="h-3 w-3" />
        In Progress
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#FCD34D" }}
    >
      Pending
    </span>
  );
}

export default function AdminJurisdictionsPage() {
  const { user, isLoaded } = useUser();
  const utils = trpc.useUtils();

  const { data: requests, isLoading } = trpc.admin.getJurisdictionRequests.useQuery(undefined, {
    enabled: isLoaded && user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL,
  });

  const markCurated = trpc.admin.markJurisdictionCurated.useMutation({
    onSuccess: () => {
      utils.admin.getJurisdictionRequests.invalidate();
      toast.success("Marked as curated");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isLoaded) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Access denied.</p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Jurisdiction Request Queue</h1>
        <p className="text-muted-foreground mt-1">
          Jurisdictions users have requested — sorted by demand. Prioritize these for manual curation.
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No jurisdiction requests yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottomColor: "rgba(255,255,255,0.07)" }}>
                <TableHead className="text-muted-foreground">Jurisdiction</TableHead>
                <TableHead className="text-muted-foreground">Code</TableHead>
                <TableHead className="text-muted-foreground text-right">Requests</TableHead>
                <TableHead className="text-muted-foreground">Last Requested</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow
                  key={req.id}
                  style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}
                >
                  <TableCell className="font-medium text-foreground">
                    {req.jurisdictionName}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                      {req.jurisdictionCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className="inline-flex items-center justify-center h-7 w-10 rounded-full text-sm font-bold"
                      style={{
                        background:
                          req.requestCount >= 10
                            ? "rgba(239,68,68,0.15)"
                            : req.requestCount >= 5
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(255,255,255,0.08)",
                        color:
                          req.requestCount >= 10
                            ? "#F87171"
                            : req.requestCount >= 5
                            ? "#FCD34D"
                            : "#94A3B8",
                      }}
                    >
                      {req.requestCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {req.lastRequestedAt
                      ? format(new Date(req.lastRequestedAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell>
                    {req.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={markCurated.isPending}
                        onClick={() => markCurated.mutate({ id: req.id })}
                        style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94A3B8" }}
                      >
                        {markCurated.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Mark as Curated"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {requests?.length ?? 0} jurisdiction{requests?.length !== 1 ? "s" : ""} requested
      </p>
    </div>
  );
}
