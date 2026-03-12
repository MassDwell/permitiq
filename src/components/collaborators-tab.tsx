"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Copy,
  Loader2,
  MoreVertical,
  Trash2,
  ShieldCheck,
  Eye,
  Pencil,
} from "lucide-react";

interface CollaboratorsTabProps {
  projectId: string;
}

function getRoleBadge(role: string) {
  switch (role) {
    case "owner":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <ShieldCheck className="h-3 w-3" />
          Owner
        </span>
      );
    case "editor":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Pencil className="h-3 w-3" />
          Editor
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground border border-white/10">
          <Eye className="h-3 w-3" />
          Viewer
        </span>
      );
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "accepted":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          Active
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Pending
        </span>
      );
  }
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function CollaboratorsTab({ projectId }: CollaboratorsTabProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.collaborators.getByProject.useQuery({ projectId });

  const inviteMutation = trpc.collaborators.invite.useMutation({
    onSuccess: () => {
      utils.collaborators.getByProject.invalidate({ projectId });
      toast.success("Invite sent");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.collaborators.updateRole.useMutation({
    onSuccess: () => {
      utils.collaborators.getByProject.invalidate({ projectId });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.collaborators.remove.useMutation({
    onSuccess: () => {
      utils.collaborators.getByProject.invalidate({ projectId });
      toast.success("Collaborator removed");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyInviteLink = (token: string) => {
    const link = `https://meritlayer.ai/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied");
  };

  const isOwner = data?.isOwner ?? false;
  const members = data?.members ?? [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Invite your GC, architect, or attorney to collaborate on this project
            </CardDescription>
          </div>
          {isOwner && (
            <Button
              onClick={() => setInviteOpen(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No collaborators yet</h3>
              <p className="text-muted-foreground mb-4">
                Invite your GC, architect, or attorney to collaborate on this project.
              </p>
              {isOwner && (
                <Button
                  onClick={() => setInviteOpen(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Role legend */}
              <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                <span><span className="text-teal-400 font-medium">Owner</span> — full access</span>
                <span><span className="text-blue-400 font-medium">Editor</span> — can upload &amp; update</span>
                <span><span className="text-foreground/60 font-medium">Viewer</span> — read-only</span>
              </div>

              {/* Members table header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-white/10">
                <span></span>
                <span>Member</span>
                <span>Role</span>
                <span>Status</span>
                <span></span>
              </div>

              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400">
                    {getInitials(member.email)}
                  </div>

                  {/* Email */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
                    {member.inviteStatus === "pending" && member.inviteToken && (
                      <button
                        onClick={() => handleCopyInviteLink(member.inviteToken!)}
                        className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 mt-0.5 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Copy invite link
                      </button>
                    )}
                  </div>

                  {/* Role */}
                  {getRoleBadge(member.role)}

                  {/* Status */}
                  {getStatusBadge(member.inviteStatus)}

                  {/* Actions */}
                  {isOwner ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: "editor" })}
                          disabled={member.role === "editor"}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: "viewer" })}
                          disabled={member.role === "viewer"}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => {
                            if (confirm("Remove this collaborator?")) {
                              removeMutation.mutate({ memberId: member.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Team Member</DialogTitle>
            <DialogDescription>
              Send an invite to your GC, architect, or attorney to collaborate on this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inviteEmail.trim()) {
                    inviteMutation.mutate({ projectId, email: inviteEmail.trim(), role: inviteRole });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor — can upload &amp; update</SelectItem>
                  <SelectItem value="viewer">Viewer — read-only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                inviteMutation.mutate({ projectId, email: inviteEmail.trim(), role: inviteRole })
              }
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
