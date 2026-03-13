"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

type Inspection = {
  id: string;
  name: string;
  inspectionType: string;
  status: string;
  scheduledDate: string | null;
  completedDate: string | null;
  inspectorName: string | null;
  notes: string | null;
  failureReason: string | null;
  sortOrder: number;
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  passed: "Passed",
  failed: "Failed",
  re_inspection: "Re-Inspection",
  waived: "Waived",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled: { bg: "rgba(100,116,139,0.15)", text: "#94A3B8", border: "rgba(100,116,139,0.3)" },
  passed: { bg: "rgba(20,184,166,0.15)", text: "#14B8A6", border: "rgba(20,184,166,0.3)" },
  failed: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
  re_inspection: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  waived: { bg: "rgba(51,65,85,0.3)", text: "#64748B", border: "rgba(51,65,85,0.5)" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.scheduled;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function InspectionsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const utils = trpc.useUtils();

  const { data: inspections, isLoading } = trpc.inspections.list.useQuery(
    { projectId },
    { retry: false }
  );

  const seedBoston = trpc.inspections.seedBoston.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate({ projectId });
      toast.success("Boston standard inspection sequence loaded");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateInspection = trpc.inspections.update.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate({ projectId });
      toast.success("Inspection updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteInspection = trpc.inspections.delete.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate({ projectId });
      toast.success("Inspection deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const createInspection = trpc.inspections.create.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate({ projectId });
      toast.success("Inspection added");
      setShowAddForm(false);
      setNewName("");
      setNewType("building");
    },
    onError: (e) => toast.error(e.message),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Record<string, Partial<Inspection>>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("building");

  const passedCount = inspections?.filter((i) => i.status === "passed").length ?? 0;
  const totalCount = inspections?.length ?? 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  const handleEdit = (inspection: Inspection, field: string, value: string | null) => {
    setEditState((prev) => ({
      ...prev,
      [inspection.id]: { ...prev[inspection.id], [field]: value },
    }));
  };

  const handleSave = (inspection: Inspection) => {
    const changes = editState[inspection.id] ?? {};
    updateInspection.mutate({ id: inspection.id, ...changes });
    setEditState((prev) => {
      const next = { ...prev };
      delete next[inspection.id];
      return next;
    });
    setExpandedId(null);
  };

  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/projects/${projectId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "#64748B",
            marginBottom: 12,
            textDecoration: "none",
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Project
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>
          Inspection Tracker
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          Track all required inspections for this project
        </p>
      </div>

      {/* CO Ready Banner */}
      {allPassed && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.3)",
            color: "#14B8A6",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          🎉 CO Ready — All inspections passed!
        </div>
      )}

      {/* Progress */}
      {totalCount > 0 && (
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#94A3B8", fontSize: 14 }}>Inspections Passed</span>
            <span style={{ color: "#14B8A6", fontWeight: 700, fontSize: 14 }}>
              {passedCount} / {totalCount}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: "#14B8A6",
                width: `${totalCount > 0 ? (passedCount / totalCount) * 100 : 0}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", padding: "32px 0" }}>
          <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
          Loading inspections...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && totalCount === 0 && (
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <p style={{ color: "#94A3B8", marginBottom: 8 }}>No inspections yet</p>
          <p style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>
            Start with the standard Boston inspection sequence, or add inspections manually.
          </p>
          <button
            onClick={() => seedBoston.mutate({ projectId })}
            disabled={seedBoston.isPending}
            style={{
              background: "#14B8A6",
              color: "#0F172A",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {seedBoston.isPending ? (
              <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            ) : null}
            Start with Boston Standard Sequence (14 steps)
          </button>
        </div>
      )}

      {/* Inspection List */}
      {inspections && inspections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {inspections.map((inspection) => {
            const isExpanded = expandedId === inspection.id;
            const edits = editState[inspection.id] ?? {};
            const currentStatus = edits.status ?? inspection.status;

            return (
              <div
                key={inspection.id}
                style={{
                  background: "#1E293B",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Row header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : inspection.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#475569",
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {inspection.sortOrder}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#F1F5F9", fontWeight: 500, fontSize: 14, margin: 0 }}>
                      {inspection.name}
                    </p>
                    <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>
                      {inspection.inspectionType.charAt(0).toUpperCase() + inspection.inspectionType.slice(1)}
                      {inspection.scheduledDate ? ` · ${inspection.scheduledDate}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={inspection.status} />
                  {isExpanded ? (
                    <ChevronUp style={{ width: 16, height: 16, color: "#475569", flexShrink: 0 }} />
                  ) : (
                    <ChevronDown style={{ width: 16, height: 16, color: "#475569", flexShrink: 0 }} />
                  )}
                </div>

                {/* Expanded edit form */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 16px 16px 16px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        paddingTop: 14,
                      }}
                    >
                      {/* Status */}
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          Status
                        </label>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleEdit(inspection as Inspection, "status", e.target.value)}
                          style={{
                            width: "100%",
                            background: "#141C2E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#F1F5F9",
                            padding: "6px 10px",
                            fontSize: 13,
                          }}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Inspector */}
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          Inspector Name
                        </label>
                        <input
                          type="text"
                          value={edits.inspectorName ?? inspection.inspectorName ?? ""}
                          onChange={(e) => handleEdit(inspection as Inspection, "inspectorName", e.target.value || null)}
                          placeholder="Inspector name"
                          style={{
                            width: "100%",
                            background: "#141C2E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#F1F5F9",
                            padding: "6px 10px",
                            fontSize: 13,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Scheduled date */}
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          Scheduled Date
                        </label>
                        <input
                          type="date"
                          value={edits.scheduledDate ?? inspection.scheduledDate ?? ""}
                          onChange={(e) => handleEdit(inspection as Inspection, "scheduledDate", e.target.value || null)}
                          style={{
                            width: "100%",
                            background: "#141C2E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#F1F5F9",
                            padding: "6px 10px",
                            fontSize: 13,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Completed date */}
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          Completed Date
                        </label>
                        <input
                          type="date"
                          value={edits.completedDate ?? inspection.completedDate ?? ""}
                          onChange={(e) => handleEdit(inspection as Inspection, "completedDate", e.target.value || null)}
                          style={{
                            width: "100%",
                            background: "#141C2E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#F1F5F9",
                            padding: "6px 10px",
                            fontSize: 13,
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Notes */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                          Notes
                        </label>
                        <textarea
                          value={edits.notes ?? inspection.notes ?? ""}
                          onChange={(e) => handleEdit(inspection as Inspection, "notes", e.target.value || null)}
                          rows={2}
                          placeholder="Optional notes..."
                          style={{
                            width: "100%",
                            background: "#141C2E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#F1F5F9",
                            padding: "6px 10px",
                            fontSize: 13,
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* Failure reason */}
                      {(currentStatus === "failed" || currentStatus === "re_inspection") && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ display: "block", fontSize: 12, color: "#EF4444", marginBottom: 4 }}>
                            Failure Reason
                          </label>
                          <textarea
                            value={edits.failureReason ?? inspection.failureReason ?? ""}
                            onChange={(e) => handleEdit(inspection as Inspection, "failureReason", e.target.value || null)}
                            rows={2}
                            placeholder="Describe the reason for failure..."
                            style={{
                              width: "100%",
                              background: "rgba(239,68,68,0.05)",
                              border: "1px solid rgba(239,68,68,0.2)",
                              borderRadius: 6,
                              color: "#F1F5F9",
                              padding: "6px 10px",
                              fontSize: 13,
                              resize: "vertical",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                      <button
                        onClick={() => {
                          if (confirm("Delete this inspection?")) {
                            deleteInspection.mutate({ id: inspection.id });
                          }
                        }}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 6,
                          color: "#EF4444",
                          padding: "6px 12px",
                          fontSize: 13,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                        Delete
                      </button>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setExpandedId(null);
                            setEditState((prev) => {
                              const next = { ...prev };
                              delete next[inspection.id];
                              return next;
                            });
                          }}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            color: "#64748B",
                            padding: "6px 14px",
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(inspection as Inspection)}
                          disabled={updateInspection.isPending}
                          style={{
                            background: "#14B8A6",
                            border: "none",
                            borderRadius: 6,
                            color: "#0F172A",
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {updateInspection.isPending && (
                            <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add custom inspection */}
      <div
        style={{
          background: "#1E293B",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: "transparent",
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 8,
              color: "#64748B",
              padding: "10px 16px",
              fontSize: 13,
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Custom Inspection
          </button>
        ) : (
          <div>
            <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Add Custom Inspection
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Special Inspection"
                  style={{
                    width: "100%",
                    background: "#141C2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: "#F1F5F9",
                    padding: "7px 10px",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#141C2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: "#F1F5F9",
                    padding: "7px 10px",
                    fontSize: 13,
                  }}
                >
                  <option value="building">Building</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="fire">Fire</option>
                  <option value="final">Final</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowAddForm(false); setNewName(""); }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "#64748B",
                  padding: "7px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newName.trim()) return;
                  createInspection.mutate({
                    projectId,
                    name: newName.trim(),
                    inspectionType: newType,
                    sortOrder: (inspections?.length ?? 0) + 1,
                  });
                }}
                disabled={!newName.trim() || createInspection.isPending}
                style={{
                  background: "#14B8A6",
                  border: "none",
                  borderRadius: 6,
                  color: "#0F172A",
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {createInspection.isPending && (
                  <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                )}
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
