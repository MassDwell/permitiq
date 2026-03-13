import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MeritLayer — AI-Powered Permit Compliance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(20,184,166,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(20,184,166,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              letterSpacing: "-2px",
              background: "linear-gradient(135deg, #14B8A6 0%, #2DD4BF 50%, #5EEAD4 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            MeritLayer
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "#94A3B8",
              fontWeight: 400,
              letterSpacing: "-0.3px",
              maxWidth: 700,
              lineHeight: 1.4,
              marginBottom: 48,
            }}
          >
            Every deadline tracked. Every project protected.
          </div>

          {/* Compliance gauge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {/* Gauge circle */}
            <div
              style={{
                position: "relative",
                width: 100,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />
                {/* Progress arc at 94% */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.94} ${2 * Math.PI * 42 * 0.06}`}
                  strokeDashoffset={2 * Math.PI * 42 * 0.25}
                  style={{ filter: "drop-shadow(0 0 8px rgba(20,184,166,0.6))" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 700, color: "#14B8A6" }}>94%</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>
                Compliance Score
              </span>
              <span style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                AI-powered tracking
              </span>
            </div>
          </div>
        </div>

        {/* Bottom feature bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            background: "rgba(20,184,166,0.08)",
            borderTop: "1px solid rgba(20,184,166,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
          }}
        >
          {[
            "AI Document Intelligence",
            "Smart Deadline Tracking",
            "Compliance Dashboard",
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#14B8A6",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#14B8A6",
                  boxShadow: "0 0 6px rgba(20,184,166,0.8)",
                }}
              />
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
