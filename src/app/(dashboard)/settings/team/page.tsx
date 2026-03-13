"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Pencil,
  Eye,
  Crown,
  Trash2,
  MailCheck,
  RefreshCw,
} from "lucide-react";

const CARD_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
};

const SECTION_HEADER_STYLE = {
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "owner":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(168,85,247,0.15)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          <Crown className="h-3 w-3" /> Owner
        </span>
      );
    case "admin":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <ShieldCheck className="h-3 w-3" /> Admin
        </span>
      );
    case "editor":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.25)" }}
        >
          <Pencil className="h-3 w-3" /> Member
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(100,116,139,0.12)", color: "#64748B", border: "1px solid rgba(100,116,139,0.25)" }}
        >
          <Eye className="h-3 w-3" /> Viewer
        </span>
      );
  }
}

function StatusDot({ status }: { status: string }) {
  if (status === "accepted") {
    return <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Active" />;
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Pending" />;
}

export default function TeamSettingsPage() {
  const utils = trpc.useUtils();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();

  const { data: membersData, isLoading: membersLoading } =
    trpc.collaborators.getByProject.useQuery(
      { projectId: selectedProject },
      { enabled: !!selectedProject }
    );

  const inviteMutation = trpc.collaborators.invite.useMutation({
    onSuccess: () => {
      utils.collaborators.getByProject.invalidate({ projectId: selectedProject });
      setInviteEmail("");
      toast.success("Invite sent successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.collaborators.remove.useMutation({
    onSuccess: () => {
      utils.collaborators.getByProject.invalidate({ projectId: selectedProject });
      toast.success("Member removed");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleInvite = () => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    inviteMutation.mutate({ projectId: selectedProject, email: inviteEmail, role: inviteRole });
  };

  const allMembers = membersData?.members ?? [];
  const pendingMembers = allMembers.filter((m) => m.inviteStatus === "pending");
  const activeMembers = allMembers.filter((m) => m.inviteStatus === "accepted");

  const isOwner = membersData?.isOwner ?? false;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9]">Team Settings</h1>
        <p className="text-[#64748B] mt-1">Manage collaborators across your projects</p>
      </div>

      <div className="space-y-6">
        {/* Project Selector */}
        <div style={CARD_STYLE}>
          <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Project Team</h2>
            </div>
            <p className="text-sm text-[#475569] mt-0.5">View and manage collaborators by project</p>
          </div>
          <div className="px-6 py-5">
            {projectsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger
                  style={{ background: "#141C2E", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
                >
                  <SelectValue placeholder="Select a project to manage team..." />
                </SelectTrigger>
                <SelectContent>
                  {(projects ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Invite Teammate */}
        {selectedProject && (
          <div style={CARD_STYLE}>
            <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#14B8A6]" />
                <h2 className="text-base font-semibold text-[#F1F5F9]">Invite Teammate</h2>
              </div>
              <p className="text-sm text-[#475569] mt-0.5">Send an invite email to collaborate on this project</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-[#475569] text-xs uppercase tracking-wide mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    style={{
                      background: "#141C2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F1F5F9",
                    }}
                  />
                </div>
                <div className="w-36">
                  <Label className="text-[#475569] text-xs uppercase tracking-wide mb-2 block">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}>
                    <SelectTrigger
                      style={{ background: "#141C2E", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending || !inviteEmail}
                  style={{ background: "#14B8A6", color: "#0F172A" }}
                  className="hover:bg-[#0D9488] font-semibold"
                >
                  {inviteMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Team Members */}
        {selectedProject && (
          <div style={CARD_STYLE}>
            <div className="px-6 py-5" style={SECTION_HEADER_STYLE}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#14B8A6]" />
                    <h2 className="text-base font-semibold text-[#F1F5F9]">Team Members</h2>
                  </div>
                  <p className="text-sm text-[#475569] mt-0.5">
                    {allMembers.length} collaborator{allMembers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {membersLoading ? (
              <div className="px-6 py-5 space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : allMembers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-3" style={{ color: "rgba(100,116,139,0.3)" }} />
                <p className="text-[#475569] font-medium">No team members yet</p>
                <p className="text-sm text-[#334155] mt-1">
                  Invite your team to collaborate on this project
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {/* Active members */}
                {activeMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                    <StatusDot status={member.inviteStatus} />
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: "rgba(20,184,166,0.12)", color: "#14B8A6" }}>
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{member.email}</p>
                      <p className="text-xs text-[#475569]">
                        Joined {member.acceptedAt ? new Date(member.acceptedAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMutation.mutate({ memberId: member.id })}
                        disabled={removeMutation.isPending}
                        className="text-[#475569] hover:text-[#EF4444] hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Pending invites */}
                {pendingMembers.length > 0 && (
                  <>
                    <div className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#475569]"
                      style={{ background: "rgba(255,255,255,0.02)" }}>
                      Pending Invites
                    </div>
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                        <StatusDot status={member.inviteStatus} />
                        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                          <MailCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#94A3B8] truncate">{member.email}</p>
                          <p className="text-xs text-[#475569]">Invite pending</p>
                        </div>
                        <RoleBadge role={member.role} />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              inviteMutation.mutate({
                                projectId: selectedProject,
                                email: member.email,
                                role: member.role as "editor" | "viewer",
                              });
                            }}
                            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748B" }}
                            className="hover:bg-white/5 text-xs"
                          >
                            Resend
                          </Button>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMutation.mutate({ memberId: member.id })}
                              disabled={removeMutation.isPending}
                              className="text-[#475569] hover:text-[#EF4444] hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
