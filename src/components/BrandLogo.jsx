import React from "react";

export default function BrandLogo({
  size = 36,
  showText = true,
  subtitle = "AI RISK & PERFORMANCE DESK",
  textColor = "#FFFFFF",
  accentColor = "#10B981",
  style = {},
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.28,
        textDecoration: "none",
        ...style,
      }}
    >
      {/* Stylized Open Journal / Book SVG Icon */}
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.35))",
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="webBookLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7CC1D3" />
              <stop offset="100%" stopColor="#4A8F9E" />
            </linearGradient>
            <linearGradient id="webBookRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#32638B" />
              <stop offset="100%" stopColor="#1B3B57" />
            </linearGradient>
          </defs>

          {/* Left Page (Curved Open Journal Leaf) */}
          <path
            d="M 18 24 
               C 18 20 22 18 26 19.5 
               Q 37 24 47 38 
               L 47 78 
               Q 35 66 21 61.5 
               C 19 60.8 18 59 18 57 
               Z"
            fill="url(#webBookLeftGrad)"
          />

          {/* Right Page (Curved Open Journal Leaf) */}
          <path
            d="M 53 38 
               Q 63 24 74 19.5 
               C 78 18 82 20 82 24 
               L 82 57 
               C 82 59 81 60.8 79 61.5 
               Q 65 66 53 78 
               Z"
            fill="url(#webBookRightGrad)"
          />

          {/* Spine Highlight Accent */}
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="77"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: size * 0.58,
              fontWeight: 900,
              color: textColor,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif",
            }}
          >
            My<span style={{ color: accentColor }}>Smart</span>Journal
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: Math.max(9, size * 0.22),
                fontWeight: 800,
                color: "#64748B",
                letterSpacing: "0.14em",
                marginTop: 2,
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
