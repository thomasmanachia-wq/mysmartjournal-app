import React from "react";

export const BrandLogo = ({
  size = 64,
  showText = true,
  subtitle = "AI RISK & PERFORMANCE DESK",
  textColor = "#FFFFFF",
  accentColor = "#10B981",
  style = {},
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.32,
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
          filter: "drop-shadow(0 0 16px rgba(100, 181, 214, 0.4))",
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
            <linearGradient id="bookLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7CC1D3" />
              <stop offset="100%" stopColor="#4A8F9E" />
            </linearGradient>
            <linearGradient id="bookRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#32638B" />
              <stop offset="100%" stopColor="#1B3B57" />
            </linearGradient>
            <filter id="pageGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.25" />
            </filter>
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
            fill="url(#bookLeftGrad)"
            filter="url(#pageGlow)"
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
            fill="url(#bookRightGrad)"
            filter="url(#pageGlow)"
          />

          {/* Spine Highlight Accent */}
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="77"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: size * 0.62,
              fontWeight: 900,
              color: textColor,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            My<span style={{ color: accentColor }}>Smart</span>Journal
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: Math.max(14, size * 0.28),
                fontWeight: 700,
                color: "#6B7FA3",
                letterSpacing: "0.12em",
                marginTop: 4,
                textTransform: "uppercase",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
