"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  ArrowRight,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { useIsOwner } from "@/hooks/use-is-owner";

const CARD_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

const SECTION_HEADER_STYLE = {
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

export default function ApiKeysPage() {
  const utils = trpc.useUtils();
  const { isOwner, ownerEmail, isLoading: ownerLoading } = useIsOwner();
  const { data: profile, isLoading: profileLoading } = trpc.settings.getProfile.useQuery();
  const { data: keys, isLoading: keysLoading } = trpc.apiKeys.list.useQuery(undefined, {
    enabled: profile?.plan === "enterprise",
  });

  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  const createMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      utils.apiKeys.list.invalidate();
      setCreatedKey(data.plaintextKey);
      setNewKeyName("");
      setShowCreate(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const revokeMutation = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      toast.success("API key revoked");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (profileLoading || ownerLoading) {
    return (
      <div className="p-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Collaborator-only users cannot access API keys
  if (!isOwner) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F1F5F9]">API Keys</h1>
          <p className="text-[#64748B] mt-1">Manage API access for programmatic integrations</p>
        </div>
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(100,116,139,0.1)" }}
          >
            <Lock className="h-7 w-7 text-[#475569]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">API access is available to account owners only</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            You have collaborator access to this workspace. API key management is restricted to the account owner.
          </p>
          {ownerEmail && (
            <p className="text-sm text-[#475569] mt-4">
              Contact{" "}
              <span className="text-[#94A3B8] font-medium">{ownerEmail}</span>{" "}
              for API access.
            </p>
          )}
        </div>
      </div>
    );
  }

  const isEnterprise = profile?.plan === "enterprise";

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9]">API Keys</h1>
        <p className="text-[#64748B] mt-1">Manage API access for programmatic integrations</p>
      </div>

      {/* Reveal modal for new key */}
      <Dialog open={!!createdKey} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Key className="h-5 w-5 text-[#14B8A6]" />
              New API Key Created
            </DialogTitle>
          </DialogHeader>
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300">
                Copy this key now. It will <strong>never be shown again</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-sm p-3 rounded-lg font-mono break-all"
              style={{ background: "#141C2E", color: "#14B8A6", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {createdKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createdKey && handleCopy(createdKey)}
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94A3B8" }}
              className="hover:bg-white/5 shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            className="w-full mt-2"
            style={{ background: "#14B8A6", color: "#0F172A" }}
            onClick={() => setCreatedKey(null)}
          >
            Done — I&apos;ve saved my key
          </Button>
        </DialogContent>
      </Dialog>

      {!isEnterprise ? (
        /* Enterprise upgrade prompt */
        <div style={CARD_STYLE}>
          <div className="px-6 py-12 text-center">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(168,85,247,0.12)" }}
            >
              <Key className="h-8 w-8 text-[#C084FC]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F1F5F9] mb-2">API Access — Enterprise Only</h3>
            <p className="text-[#475569] mb-6 max-w-sm mx-auto">
              Programmatic API access is available on the Enterprise plan. Integrate MeritLayer with your
              existing workflows, project management systems, and dashboards.
            </p>
            <Button
              asChild
              style={{ background: "#14B8A6", color: "#0F172A" }}
              className="hover:bg-[#0D9488] font-semibold"
            >
              <a href="/pricing">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Enterprise
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Create new key */}
          <div style={CARD_STYLE}>
            <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="text-base font-semibold text-[#F1F5F9]">Generate New Key</h2>
              </div>
              <p className="text-sm text-[#475569] mt-0.5">Keys are shown only once upon creation</p>
            </div>
            <div className="px-6 py-5">
              {showCreate ? (
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-[#475569] text-xs uppercase tracking-wide mb-2 block">
                      Key Name
                    </Label>
                    <Input
                      placeholder="e.g. Production Integration, CI/CD Pipeline"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && newKeyName && createMutation.mutate({ name: newKeyName })}
                      style={{ background: "#141C2E", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
                    />
                  </div>
                  <Button
                    onClick={() => newKeyName && createMutation.mutate({ name: newKeyName })}
                    disabled={createMutation.isPending || !newKeyName}
                    style={{ background: "#14B8A6", color: "#0F172A" }}
                    className="hover:bg-[#0D9488] font-semibold"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748B" }}
                    className="hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowCreate(true)}
                  style={{ background: "#14B8A6", color: "#0F172A" }}
                  className="hover:bg-[#0D9488] font-semibold gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Generate New API Key
                </Button>
              )}
            </div>
          </div>

          {/* Existing keys */}
          <div style={CARD_STYLE}>
            <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="text-base font-semibold text-[#F1F5F9]">Active API Keys</h2>
              </div>
              <p className="text-sm text-[#475569] mt-0.5">
                {(keys ?? []).length} key{(keys ?? []).length !== 1 ? "s" : ""} active
              </p>
            </div>

            {keysLoading ? (
              <div className="px-6 py-5 space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (keys ?? []).length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Key className="h-12 w-12 mx-auto mb-3" style={{ color: "rgba(100,116,139,0.3)" }} />
                <p className="text-[#475569]">No API keys yet</p>
                <p className="text-sm text-[#334155] mt-1">Generate your first key to get started</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div
                  className="px-6 py-3 grid grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider text-[#475569]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span>Name</span>
                  <span>Key</span>
                  <span>Last Used</span>
                  <span>Created</span>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {(keys ?? []).map((key) => (
                    <div key={key.id} className="px-6 py-4 grid grid-cols-4 gap-4 items-center">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{key.name}</p>
                      <code className="text-sm font-mono text-[#64748B]">
                        {key.keyPrefix}...
                      </code>
                      <span className="text-sm text-[#475569]">
                        {key.lastUsedAt ? format(new Date(key.lastUsedAt), "MMM d, yyyy") : "Never"}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#475569]">
                          {key.createdAt ? format(new Date(key.createdAt), "MMM d, yyyy") : "—"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeMutation.mutate({ id: key.id })}
                          disabled={revokeMutation.isPending}
                          className="text-[#475569] hover:text-[#EF4444] hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Docs callout */}
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}
          >
            <p className="text-sm text-[#64748B]">
              <span className="text-[#14B8A6] font-medium">API Base URL:</span>{" "}
              <code className="text-[#94A3B8]">https://meritlayer.ai/api/v1</code>
            </p>
            <p className="text-xs text-[#475569] mt-1">
              Authenticate with <code className="text-[#64748B]">Authorization: Bearer &lt;key&gt;</code> header.
              Available endpoints: <code className="text-[#64748B]">GET /api/v1/projects</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
