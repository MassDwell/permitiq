"use client";

import { useState, useRef } from "react";
import { Loader2, Copy, Check, RotateCcw } from "lucide-react";

interface CommentResponseAssistantProps {
  projectAddress: string;
  defaultPermitType?: string;
}

export function CommentResponseAssistant({
  projectAddress,
  defaultPermitType = "",
}: CommentResponseAssistantProps) {
  const [permitType, setPermitType] = useState(defaultPermitType);
  const [objectionText, setObjectionText] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleDraft = async () => {
    if (!objectionText.trim()) return;
    setError("");
    setOutput("");
    setIsDone(false);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/response-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectionText, projectAddress, permitType }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setOutput(accumulated);
      }

      setIsDone(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setOutput("");
    setObjectionText("");
    setPermitType(defaultPermitType);
    setIsDone(false);
    setError("");
    setIsStreaming(false);
  };

  return (
    <div>
      {/* Form */}
      <div
        style={{
          background: "#0E1525",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: 500 }}
          >
            Permit Type
          </label>
          <input
            type="text"
            value={permitType}
            onChange={(e) => setPermitType(e.target.value)}
            placeholder="e.g. Building Permit, Demolition, Electrical..."
            style={{
              width: "100%",
              background: "#141C2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#F1F5F9",
              padding: "10px 14px",
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: 500 }}
          >
            Objection / Comment Text *
          </label>
          <textarea
            value={objectionText}
            onChange={(e) => setObjectionText(e.target.value)}
            placeholder="Paste the permit objection, reviewer comment, or denial reason here..."
            rows={7}
            style={{
              width: "100%",
              background: "#141C2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#F1F5F9",
              padding: "10px 14px",
              fontSize: 14,
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {projectAddress && (
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>
            Project address: {projectAddress}
          </p>
        )}

        <button
          onClick={handleDraft}
          disabled={isStreaming || !objectionText.trim()}
          style={{
            background: isStreaming || !objectionText.trim() ? "rgba(20,184,166,0.4)" : "#14B8A6",
            border: "none",
            borderRadius: 8,
            color: "#080D1A",
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: isStreaming || !objectionText.trim() ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.2s",
          }}
        >
          {isStreaming ? (
            <>
              <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
              Drafting Response...
            </>
          ) : (
            "Draft Response"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#EF4444",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Output */}
      {(output || isStreaming) && (
        <div
          style={{
            background: "#0E1525",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Output header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>
              {isStreaming ? "Drafting..." : "Draft Response"}
            </span>
            {isDone && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${copied ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 6,
                    color: copied ? "#14B8A6" : "#94A3B8",
                    padding: "5px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? (
                    <>
                      <Check style={{ width: 12, height: 12 }} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: 12, height: 12 }} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    color: "#64748B",
                    padding: "5px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <RotateCcw style={{ width: 12, height: 12 }} />
                  Clear & Try Again
                </button>
              </div>
            )}
          </div>

          {/* Output text */}
          <div
            style={{
              padding: 20,
              maxHeight: 600,
              overflowY: "auto",
            }}
          >
            <pre
              style={{
                fontFamily: "inherit",
                fontSize: 14,
                color: "#CBD5E1",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {output}
              {isStreaming && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    background: "#14B8A6",
                    marginLeft: 2,
                    animation: "blink 1s step-end infinite",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </pre>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
