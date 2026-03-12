"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Bot, User, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_PROMPTS = [
  "What's my BPDA deadline?",
  "What are my parking requirements?",
  "Summarize the compliance items",
  "What documents am I missing?",
];

interface DocumentChatProps {
  projectId: string;
}

export function DocumentChat({ projectId }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Optimistic assistant placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/document-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: trimmed,
          history: messages,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to get response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't process that request. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 600,
        borderRadius: 16,
        background: "#0E1525",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(14,165,233,0.2))",
            border: "1px solid rgba(20,184,166,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bot className="h-4 w-4" style={{ color: "#14B8A6" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "#E2E8F0", fontSize: "0.9rem", lineHeight: 1.2 }}>Ask Your Documents</p>
          <p style={{ fontSize: "0.75rem", color: "#475569" }}>AI-powered answers from your project data</p>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(14,165,233,0.15))",
                border: "1px solid rgba(20,184,166,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare className="h-6 w-6" style={{ color: "#14B8A6" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, color: "#CBD5E1", marginBottom: "0.25rem" }}>Ask anything about your project</p>
              <p style={{ fontSize: "0.85rem", color: "#475569" }}>I have access to your documents, permits, and compliance items</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    padding: "0.4rem 0.875rem",
                    borderRadius: 999,
                    fontSize: "0.8rem",
                    color: "#94A3B8",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(20,184,166,0.1)";
                    e.currentTarget.style.color = "#14B8A6";
                    e.currentTarget.style.borderColor = "rgba(20,184,166,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#94A3B8";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.75rem",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    msg.role === "user"
                      ? "rgba(99,102,241,0.15)"
                      : "rgba(20,184,166,0.15)",
                  border: `1px solid ${msg.role === "user" ? "rgba(99,102,241,0.25)" : "rgba(20,184,166,0.25)"}`,
                }}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5" style={{ color: "#818CF8" }} />
                ) : (
                  <Bot className="h-3.5 w-3.5" style={{ color: "#14B8A6" }} />
                )}
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "0.75rem 1rem",
                  borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                  background: msg.role === "user" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${msg.role === "user" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)"}`,
                  fontSize: "0.875rem",
                  color: "#CBD5E1",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.content === "" && isLoading && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#14B8A6" }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your project documents..."
          rows={1}
          disabled={isLoading}
          style={{
            flex: 1,
            resize: "none",
            borderRadius: 10,
            padding: "0.625rem 0.875rem",
            fontSize: "0.875rem",
            color: "#E2E8F0",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            outline: "none",
            lineHeight: 1.5,
            fontFamily: "inherit",
            maxHeight: 120,
            overflowY: "auto",
          }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
          }}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{
            padding: "0.625rem",
            borderRadius: 10,
            background: input.trim() && !isLoading ? "linear-gradient(135deg, #14B8A6, #0EA5E9)" : "rgba(255,255,255,0.05)",
            border: "none",
            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            flexShrink: 0,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#14B8A6" }} />
          ) : (
            <Send className="h-4 w-4" style={{ color: input.trim() ? "#fff" : "#475569" }} />
          )}
        </Button>
      </div>
    </div>
  );
}
