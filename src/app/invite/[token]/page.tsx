"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Pencil, Eye, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

function getRoleLabel(role: string) {
  switch (role) {
    case "owner":
      return { icon: <ShieldCheck className="h-5 w-5" />, label: "Owner", desc: "Full access to the project" };
    case "editor":
      return { icon: <Pencil className="h-5 w-5" />, label: "Editor", desc: "Can upload documents and update records" };
    default:
      return { icon: <Eye className="h-5 w-5" />, label: "Viewer", desc: "Read-only access to the project" };
  }
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  const { data, isLoading, error } = trpc.collaborators.getByToken.useQuery({ token });

  const acceptMutation = trpc.collaborators.acceptInvite.useMutation({
    onSuccess: ({ projectId, alreadyAccepted }) => {
      if (alreadyAccepted) {
        toast.info("Invite already accepted");
      } else {
        toast.success("Invite accepted! Welcome to the team.");
      }
      if (isSignedIn) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push(`/sign-up?redirect_url=/projects/${projectId}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading || !userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#080D1A' }}>
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#080D1A' }}>
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Invite</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is invalid or has already been used.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { member, projectName } = data;
  const roleInfo = getRoleLabel(member.role);
  const alreadyAccepted = member.inviteStatus === "accepted";

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#080D1A' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-xl font-bold tracking-tight text-foreground mb-1">MeritLayer</div>
          <div className="text-xs text-muted-foreground">AI-Powered Construction Compliance</div>
        </div>

        {alreadyAccepted ? (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground text-center mb-2">
              Already Joined
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              You&apos;ve already accepted this invite to <span className="text-foreground font-medium">{projectName}</span>.
            </p>
            {isSignedIn ? (
              <Button
                className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                onClick={() => router.push(`/projects/${data.projectId}`)}
              >
                Go to Project
              </Button>
            ) : (
              <Link href="/sign-in">
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white">
                  Sign In to Access
                </Button>
              </Link>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-teal-500/20 flex items-center justify-center">
                <div className="text-teal-400">{roleInfo.icon}</div>
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground text-center mb-2">
              You&apos;ve been invited to collaborate
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Join <span className="text-foreground font-medium">{projectName}</span> on MeritLayer
            </p>

            {/* Role card */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  {roleInfo.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{roleInfo.label} Access</p>
                  <p className="text-xs text-muted-foreground">{roleInfo.desc}</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-500 text-white mb-3"
              onClick={() => acceptMutation.mutate({ token })}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>

            {!isSignedIn && (
              <p className="text-xs text-muted-foreground text-center">
                You&apos;ll be asked to create an account or sign in after accepting.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
