"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Plus, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "legal", label: "Legal" },
  { value: "architectural", label: "Architectural" },
  { value: "engineering", label: "Engineering" },
  { value: "survey", label: "Survey" },
  { value: "permit_fees", label: "Permit Fees" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

const CATEGORY_COLORS: Record<Category, string> = {
  legal: "#8B5CF6",
  architectural: "#14B8A6",
  engineering: "#3B82F6",
  survey: "#F59E0B",
  permit_fees: "#EF4444",
  consulting: "#10B981",
  other: "#475569",
};

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function parseDollars(str: string): number {
  return Math.round((parseFloat(str.replace(/[^0-9.]/g, "")) || 0) * 100);
}

interface AddFormState {
  category: Category;
  description: string;
  vendor: string;
  amount: string;
  isPaid: boolean;
  notes: string;
}

const EMPTY_FORM: AddFormState = {
  category: "architectural",
  description: "",
  vendor: "",
  amount: "",
  isPaid: false,
  notes: "",
};

interface SoftCostsTabProps {
  projectId: string;
}

export function SoftCostsTab({ projectId }: SoftCostsTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: costs, isLoading } = trpc.softCosts.list.useQuery({ projectId });
  const { data: summary } = trpc.softCosts.summary.useQuery({ projectId });

  const create = trpc.softCosts.create.useMutation({
    onSuccess: () => {
      utils.softCosts.list.invalidate({ projectId });
      utils.softCosts.summary.invalidate({ projectId });
      setForm(EMPTY_FORM);
      setShowAdd(false);
      toast.success("Expense added");
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.softCosts.update.useMutation({
    onSuccess: () => {
      utils.softCosts.list.invalidate({ projectId });
      utils.softCosts.summary.invalidate({ projectId });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.softCosts.delete.useMutation({
    onSuccess: () => {
      utils.softCosts.list.invalidate({ projectId });
      utils.softCosts.summary.invalidate({ projectId });
      setDeletingId(null);
      toast.success("Expense removed");
    },
    onError: (e) => {
      setDeletingId(null);
      toast.error(e.message);
    },
  });

  const handleCreate = () => {
    const amount = parseDollars(form.amount);
    if (!form.description.trim()) return toast.error("Description required");
    if (amount <= 0) return toast.error("Enter a valid amount");
    create.mutate({
      projectId,
      category: form.category,
      description: form.description.trim(),
      vendor: form.vendor.trim() || undefined,
      amount,
      isPaid: form.isPaid,
      notes: form.notes.trim() || undefined,
    });
  };

  const togglePaid = (id: string, current: boolean) => {
    update.mutate({ id, isPaid: !current });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate({ id });
  };

  const maxCategory = summary?.largestCategory as Category | null | undefined;
  const maxAmount = maxCategory ? (summary?.byCategory[maxCategory] ?? 0) : 0;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "#0E1525",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Soft Cost Tracker</h3>
          <p className="text-sm text-[#64748B] mt-0.5">
            Track professional fees and permit-related expenses.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd((v) => !v)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>

      {/* Summary header */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-[#64748B] mb-1">Total Budgeted</p>
            <p className="text-lg font-bold text-foreground">
              {formatDollars(summary.totalBudgeted)}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-[#64748B] mb-1">Total Paid</p>
            <p className="text-lg font-bold text-green-400">
              {formatDollars(summary.totalPaid)}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-[#64748B] mb-1">Unpaid</p>
            <p className="text-lg font-bold text-amber-400">
              {formatDollars(summary.totalUnpaid)}
            </p>
          </div>
        </div>
      )}

      {/* Category bar chart */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-3">
            By Category
          </p>
          {CATEGORIES.filter((c) => summary.byCategory[c.value]).map((cat) => {
            const amt = summary.byCategory[cat.value] ?? 0;
            const pct = maxAmount > 0 ? (amt / maxAmount) * 100 : 0;
            return (
              <div key={cat.value} className="flex items-center gap-3">
                <span className="text-xs text-[#64748B] w-24 shrink-0">{cat.label}</span>
                <div
                  className="flex-1 rounded-full overflow-hidden h-2"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: CATEGORY_COLORS[cat.value as Category],
                    }}
                  />
                </div>
                <span className="text-xs text-[#94A3B8] tabular-nums w-20 text-right">
                  {formatDollars(amt)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add expense inline form */}
      {showAdd && (
        <div
          className="rounded-lg p-4 mb-5 space-y-3"
          style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <p className="text-sm font-medium text-[#14B8A6] mb-3">New Expense</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748B] block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                className="w-full rounded-lg px-3 py-1.5 text-sm text-foreground"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748B] block mb-1">Amount ($)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1500"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-[#334155]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Description *</label>
            <input
              type="text"
              placeholder="e.g. Architectural drawings review"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-[#334155]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none",
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748B] block mb-1">Vendor</label>
              <input
                type="text"
                placeholder="e.g. Smith Architecture"
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                className="w-full rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-[#334155]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPaid}
                  onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))}
                  style={{ accentColor: "#14B8A6" }}
                />
                <span className="text-sm text-[#94A3B8]">Already paid</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleCreate} disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Itemized table */}
      {isLoading ? (
        <div className="text-sm text-[#475569] py-4 text-center">Loading expenses...</div>
      ) : !costs || costs.length === 0 ? (
        <div
          className="rounded-lg p-5 text-center text-sm text-[#475569]"
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px dashed rgba(255,255,255,0.06)",
          }}
        >
          No expenses tracked yet. Add your first expense above.
        </div>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div
            className="grid text-xs text-[#475569] uppercase tracking-wider px-3 py-2"
            style={{ gridTemplateColumns: "1fr 1fr 100px 80px 36px" }}
          >
            <span>Description</span>
            <span>Vendor</span>
            <span className="text-right">Amount</span>
            <span className="text-center">Status</span>
            <span />
          </div>
          {costs.map((cost) => (
            <div
              key={cost.id}
              className="grid items-center rounded-lg px-3 py-2.5 group"
              style={{
                gridTemplateColumns: "1fr 1fr 100px 80px 36px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: CATEGORY_COLORS[cost.category as Category] ?? "#475569",
                    }}
                  />
                  <span className="text-sm text-foreground truncate">{cost.description}</span>
                </div>
                <span className="text-xs text-[#475569] ml-4">
                  {CATEGORIES.find((c) => c.value === cost.category)?.label ?? cost.category}
                  {cost.createdAt && (
                    <span className="ml-2">
                      · {format(new Date(cost.createdAt), "MMM d")}
                    </span>
                  )}
                </span>
              </div>
              <span className="text-sm text-[#64748B] truncate pr-2">{cost.vendor ?? "—"}</span>
              <span className="text-sm font-medium text-foreground tabular-nums text-right">
                {formatDollars(cost.amount)}
              </span>
              <div className="flex justify-center">
                <button
                  onClick={() => togglePaid(cost.id, cost.isPaid ?? false)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: cost.isPaid
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: cost.isPaid
                      ? "1px solid rgba(16,185,129,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: cost.isPaid ? "#10B981" : "#64748B",
                  }}
                >
                  {cost.isPaid ? (
                    <>
                      <Check className="h-3 w-3" />
                      Paid
                    </>
                  ) : (
                    "Unpaid"
                  )}
                </button>
              </div>
              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(cost.id)}
                  disabled={deletingId === cost.id}
                  className="p-1 rounded text-[#475569] hover:text-red-400 transition-colors"
                >
                  {deletingId === cost.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
