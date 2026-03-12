"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CommentResponseAssistant } from "@/components/comment-response-assistant";

export default function ResponseAssistantPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading } = trpc.projects.get.useQuery(
    { id: projectId },
    { retry: false }
  );

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
          Comment Response Assistant
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          AI-powered responses to permit objections and reviewer comments — citing 780 CMR and IBC.
        </p>
      </div>

      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", padding: "16px 0" }}>
          <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
          Loading project...
        </div>
      )}

      {!isLoading && (
        <CommentResponseAssistant
          projectAddress={project?.address ?? ""}
          defaultPermitType=""
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
